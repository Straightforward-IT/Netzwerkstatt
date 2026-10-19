import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Canvas, Fill, Group, Path, Skia, useFont } from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { cancelAnimation, Easing, runOnJS, useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';

import { fitViewport, focusViewport, hitTestNode, MAX_SCALE, MIN_SCALE, resizeViewport, screenToWorld, zoomAtPoint } from '../../services/graph-math';
import { palettes } from '../../theme/tokens';
import type { Category, GraphLayout, Person, Relationship, Viewport } from '../../types/network';
import { GraphCluster } from './GraphCluster';
import { GraphEdge } from './GraphEdge';
import { GraphNode } from './GraphNode';

export interface GraphHandle {
  /** Restore the overview without changing the selection. */
  reset(): void;
  /** Select and smoothly center a person. */
  focus(personId: string): void;
  /** Zoom around the middle of the visible graph. */
  zoom(factor: number): void;
}

export interface NetworkGraphProps {
  people: Person[];
  categories: Category[];
  relationships: Relationship[];
  layout: GraphLayout;
  matchingIds: string[];
  selectedPersonId: string | null;
  onSelectPerson: (id: string | null) => void;
  onFocusPerson?: (id: string) => void;
  onLongPressPerson?: (id: string) => void;
  onViewportChange?: (viewport: Viewport) => void;
  dark: boolean;
}

const FONT = require('@expo-google-fonts/manrope/600SemiBold/Manrope_600SemiBold.ttf');

export const NetworkGraph = forwardRef<GraphHandle, NetworkGraphProps>(function NetworkGraph({
  people, categories, relationships, layout, matchingIds, selectedPersonId,
  onSelectPerson, onFocusPerson, onLongPressPerson, onViewportChange, dark,
}, ref) {
  const palette = dark ? palettes.dark : palettes.light;
  const [size, setSize] = useState({ width: 0, height: 0 });
  const measuredSize = useRef(size);
  const pendingFocus = useRef<string | null>(null);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const scale = useSharedValue(1);
  const pinchActive = useSharedValue(false);
  const pinchStartScale = useSharedValue(1);
  const pinchAnchorX = useSharedValue(0);
  const pinchAnchorY = useSharedValue(0);
  const panLastX = useSharedValue(0);
  const panLastY = useSharedValue(0);
  const panNeedsRebase = useSharedValue(false);

  const initialFont = useFont(FONT, 15);
  const labelFont = useFont(FONT, 12);
  const detailFont = useFont(FONT, 10);
  const clusterFont = useFont(FONT, 10);

  // Skia subscribes to these values directly. No React renders or JS callbacks
  // are needed for animation frames, panning, pinching, or progressive labels.
  const transform = useDerivedValue(() => [{ translateX: x.value }, { translateY: y.value }, { scale: scale.value }]);
  const labelOpacity = useDerivedValue(() => Math.max(0, Math.min(1, (scale.value - 0.66) / 0.14)));
  const detailOpacity = useDerivedValue(() => Math.max(0, Math.min(1, (scale.value - 1.05) / 0.3)));
  // Compensate only the text, leaving positions and node hit targets in world
  // coordinates. Initials stay inside their rings even at the minimum zoom.
  const initialTransform = useDerivedValue(() => [{ scale: Math.min(1.65, Math.max(1, 9.5 / (15 * scale.value))) }]);
  const labelTransform = useDerivedValue(() => [{ scale: Math.max(1, 11 / (12 * scale.value)) }]);
  const clusterLabelTransform = useDerivedValue(() => [{ scale: Math.max(1, 1 / scale.value) }]);

  const reportViewport = useCallback((viewport: Viewport) => onViewportChange?.(viewport), [onViewportChange]);

  const animateTo = useCallback((viewport: Viewport) => {
    const animation = { duration: 320, easing: Easing.out(Easing.cubic) };
    x.value = withTiming(viewport.x, animation);
    y.value = withTiming(viewport.y, animation);
    scale.value = withTiming(viewport.scale, animation, (finished) => {
      if (finished) runOnJS(reportViewport)(viewport);
    });
  }, [x, y, scale, reportViewport]);

  const reset = useCallback(() => {
    if (size.width > 0 && size.height > 0) animateTo(fitViewport(layout.nodes, size.width, size.height));
  }, [animateTo, layout.nodes, size]);

  const focus = useCallback((personId: string) => {
    const node = layout.nodes.find((item) => item.personId === personId);
    if (!node) return;
    onSelectPerson(personId);
    onFocusPerson?.(personId);
    const { width, height } = measuredSize.current;
    if (width <= 0 || height <= 0) {
      pendingFocus.current = personId;
      return;
    }
    pendingFocus.current = null;
    animateTo(focusViewport(node, width, height));
  }, [animateTo, layout.nodes, onFocusPerson, onSelectPerson]);

  useImperativeHandle(ref, () => ({
    reset,
    focus,
    zoom: (factor) => animateTo(zoomAtPoint(
      { x: x.value, y: y.value, scale: scale.value }, factor,
      { x: size.width / 2, y: size.height / 2 },
    )),
  }), [animateTo, focus, reset, scale, size, x, y]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    const previousSize = measuredSize.current;
    if (width <= 0 || height <= 0 || (previousSize.width === width && previousSize.height === height)) return;
    measuredSize.current = { width, height };
    setSize({ width, height });
    cancelAnimation(x);
    cancelAnimation(y);
    cancelAnimation(scale);
    const focusedNode = pendingFocus.current ? layout.nodes.find((node) => node.personId === pendingFocus.current) : undefined;
    const viewport = focusedNode
      ? focusViewport(focusedNode, width, height)
      : previousSize.width > 0 && previousSize.height > 0
        ? resizeViewport({ x: x.value, y: y.value, scale: scale.value }, previousSize.width, previousSize.height, width, height)
        : fitViewport(layout.nodes, width, height);
    pendingFocus.current = null;
    x.value = viewport.x;
    y.value = viewport.y;
    scale.value = viewport.scale;
    reportViewport(viewport);
  }, [layout.nodes, reportViewport, scale, x, y]);

  const handlePress = useCallback((kind: 'tap' | 'double' | 'long', screenX: number, screenY: number, viewport: Viewport) => {
    const node = hitTestNode(layout.nodes, screenToWorld({ x: screenX, y: screenY }, viewport), viewport.scale);
    if (kind === 'long') {
      if (node) {
        onSelectPerson(node.personId);
        onLongPressPerson?.(node.personId);
      }
    } else if (kind === 'double') {
      if (node) focus(node.personId);
      else {
        onSelectPerson(null);
        reset();
      }
    } else {
      onSelectPerson(node?.personId ?? null);
    }
  }, [focus, layout.nodes, onLongPressPerson, onSelectPerson, reset]);

  const gesture = useMemo(() => {
    const pan = Gesture.Pan()
      .minDistance(5)
      .maxPointers(1)
      .onStart((event) => {
        cancelAnimation(x);
        cancelAnimation(y);
        cancelAnimation(scale);
        panLastX.value = event.translationX;
        panLastY.value = event.translationY;
      })
      .onUpdate((event) => {
        // Pinch owns both translation and scale while two fingers are down.
        // Rebase after it ends so lifting a finger cannot jump the viewport.
        if (!pinchActive.value && event.numberOfPointers === 1 && !panNeedsRebase.value) {
          x.value += event.translationX - panLastX.value;
          y.value += event.translationY - panLastY.value;
        }
        panNeedsRebase.value = event.numberOfPointers !== 1 || pinchActive.value;
        panLastX.value = event.translationX;
        panLastY.value = event.translationY;
      })
      .onEnd(() => {
        if (!pinchActive.value) runOnJS(reportViewport)({ x: x.value, y: y.value, scale: scale.value });
      });

    const pinch = Gesture.Pinch()
      .onStart((event) => {
        cancelAnimation(x);
        cancelAnimation(y);
        cancelAnimation(scale);
        pinchActive.value = true;
        pinchStartScale.value = scale.value;
        // Read the focal point only after activation; Android can report 0,0
        // in onBegin. This world point stays anchored under the moving focal.
        pinchAnchorX.value = (event.focalX - x.value) / scale.value;
        pinchAnchorY.value = (event.focalY - y.value) / scale.value;
      })
      .onUpdate((event) => {
        if (event.numberOfPointers < 2) return;
        const nextScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, pinchStartScale.value * event.scale));
        scale.value = nextScale;
        x.value = event.focalX - pinchAnchorX.value * nextScale;
        y.value = event.focalY - pinchAnchorY.value * nextScale;
      })
      .onEnd(() => runOnJS(reportViewport)({ x: x.value, y: y.value, scale: scale.value }))
      .onFinalize(() => {
        if (pinchActive.value) {
          pinchActive.value = false;
          panNeedsRebase.value = true;
        }
      });

    const tap = Gesture.Tap().maxDuration(240).maxDistance(10).onEnd((event, success) => {
      if (success) runOnJS(handlePress)('tap', event.x, event.y, { x: x.value, y: y.value, scale: scale.value });
    });
    const doubleTap = Gesture.Tap().numberOfTaps(2).maxDelay(250).maxDuration(240).maxDistance(10).onEnd((event, success) => {
      if (success) runOnJS(handlePress)('double', event.x, event.y, { x: x.value, y: y.value, scale: scale.value });
    });
    const longPress = Gesture.LongPress().minDuration(480).maxDistance(10).onStart((event) => {
      runOnJS(handlePress)('long', event.x, event.y, { x: x.value, y: y.value, scale: scale.value });
    });
    return Gesture.Race(Gesture.Simultaneous(pan, pinch), Gesture.Exclusive(longPress, doubleTap, tap));
  }, [handlePress, panLastX, panLastY, panNeedsRebase, pinchActive, pinchAnchorX, pinchAnchorY, pinchStartScale, reportViewport, scale, x, y]);

  const graph = useMemo(() => {
    const peopleById = new Map(people.map((person) => [person.id, person]));
    const categoriesById = new Map(categories.map((category) => [category.id, category]));
    const nodesById = new Map(layout.nodes.map((node) => [node.personId, node]));
    const matches = new Set(matchingIds);
    const filtering = people.some((person) => !person.isSelf && !matches.has(person.id));
    const neighbors = new Set<string>();
    const selectedNeighbors = new Set<string>();
    for (const relationship of relationships) {
      if (matches.has(relationship.sourcePersonId)) neighbors.add(relationship.targetPersonId);
      if (matches.has(relationship.targetPersonId)) neighbors.add(relationship.sourcePersonId);
      if (relationship.sourcePersonId === selectedPersonId) selectedNeighbors.add(relationship.targetPersonId);
      if (relationship.targetPersonId === selectedPersonId) selectedNeighbors.add(relationship.sourcePersonId);
    }
    const opacityFor = (personId: string) => {
      if (personId === selectedPersonId || peopleById.get(personId)?.isSelf) return 1;
      if (filtering) return matches.has(personId) ? 1 : neighbors.has(personId) || selectedNeighbors.has(personId) ? 0.48 : 0.12;
      if (selectedPersonId) return selectedNeighbors.has(personId) || peopleById.get(personId)?.isSelf ? 1 : 0.42;
      return 1;
    };
    return {
      nodes: layout.nodes.flatMap((position) => {
        const person = peopleById.get(position.personId);
        if (!person) return [];
        return [{ position, person, categories: person.categoryIds.flatMap((id) => categoriesById.get(id) ?? []), opacity: opacityFor(person.id) }];
      }),
      edges: relationships.flatMap((relationship) => {
        const source = nodesById.get(relationship.sourcePersonId);
        const target = nodesById.get(relationship.targetPersonId);
        if (!source || !target || source.personId === target.personId) return [];
        const highlighted = source.personId === selectedPersonId || target.personId === selectedPersonId;
        const opacity = highlighted ? 0.85 : Math.min(opacityFor(source.personId), opacityFor(target.personId)) * (selectedPersonId ? 0.23 : 0.3);
        return [{ relationship, source, target, highlighted, opacity }];
      }),
      clusters: layout.clusters.flatMap((position) => {
        const category = categoriesById.get(position.categoryId);
        if (!category) return [];
        const members = layout.nodes.filter((node) => peopleById.get(node.personId)?.categoryIds.find((id) => categoriesById.has(id)) === category.id);
        const radius = Math.max(88, ...members.map((node) => Math.hypot(node.x - position.x, node.y - position.y) + 53));
        return [{ position, category, radius, count: members.length, opacity: filtering && !members.some((member) => matches.has(member.personId)) ? 0.28 : 1 }];
      }),
    };
  }, [categories, layout, matchingIds, people, relationships, selectedPersonId]);

  const dots = useMemo(() => {
    const path = Skia.PathBuilder.Make();
    for (let dotX = 18; dotX < size.width; dotX += 26) {
      for (let dotY = 18; dotY < size.height; dotY += 26) path.addCircle(dotX, dotY, 0.75);
    }
    return path.detach();
  }, [size]);

  return (
    <GestureDetector gesture={gesture}>
      <View
        style={[styles.canvas, { backgroundColor: palette.background }]}
        onLayout={handleLayout}
        collapsable={false}
        accessible
        accessibilityRole="image"
        accessibilityLabel={`Netzwerkgraph mit ${people.length} Personen. Eine zugängliche Liste findest du im Bereich Personen.`}
        accessibilityHint="Ziehen verschiebt den Graphen. Mit zwei Fingern zoomen. Tippen öffnet ein Profil, doppelt tippen fokussiert eine Person."
        testID="network-graph"
      >
        <Canvas style={styles.canvas}>
          <Fill color={palette.background} />
          <Path path={dots} color={palette.border} opacity={0.6} />
          <Group transform={transform}>
            {graph.clusters.map((cluster) => <GraphCluster key={cluster.category.id} {...cluster} font={clusterFont} labelTransform={clusterLabelTransform} />)}
            {graph.edges.map((edge) => <GraphEdge key={edge.relationship.id} {...edge} palette={palette} />)}
            {graph.nodes.map((node) => (
              <GraphNode
                key={node.person.id}
                {...node}
                selected={node.person.id === selectedPersonId}
                palette={palette}
                initialFont={initialFont}
                labelFont={labelFont}
                detailFont={detailFont}
                initialTransform={initialTransform}
                labelTransform={labelTransform}
                labelOpacity={labelOpacity}
                detailOpacity={detailOpacity}
              />
            ))}
          </Group>
        </Canvas>
      </View>
    </GestureDetector>
  );
});

const styles = StyleSheet.create({ canvas: { flex: 1, minWidth: 0, minHeight: 0 } });

export default NetworkGraph;
