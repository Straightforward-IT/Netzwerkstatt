import { memo, useMemo } from 'react';
import { Group, Path } from '@shopify/react-native-skia';

import { NODE_RADIUS } from '../../services/graph-math';
import { relationshipTypeMetadata, type GraphNode, type Relationship } from '../../types/network';
import type { Theme } from '../../theme/tokens';

interface GraphEdgeProps {
  relationship: Relationship;
  source: GraphNode;
  target: GraphNode;
  highlighted: boolean;
  opacity: number;
  palette: Theme;
}

/** Trim each curve to its node ring and point the arrow along its final tangent. */
function edgeGeometry(source: GraphNode, target: GraphNode, id: string) {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const length = Math.hypot(dx, dy) || 1;
  const sign = [...id].reduce((sum, letter) => sum + letter.charCodeAt(0), 0) % 2 ? 1 : -1;
  const bend = Math.min(27, length * 0.1) * sign;
  const control = { x: (source.x + target.x) / 2 - (dy / length) * bend, y: (source.y + target.y) / 2 + (dx / length) * bend };
  const startAngle = Math.atan2(control.y - source.y, control.x - source.x);
  const endAngle = Math.atan2(target.y - control.y, target.x - control.x);
  const clearance = NODE_RADIUS + 6;
  const start = { x: source.x + Math.cos(startAngle) * clearance, y: source.y + Math.sin(startAngle) * clearance };
  const end = { x: target.x - Math.cos(endAngle) * clearance, y: target.y - Math.sin(endAngle) * clearance };
  const arrowLength = 8;
  const left = { x: end.x - Math.cos(endAngle - 0.45) * arrowLength, y: end.y - Math.sin(endAngle - 0.45) * arrowLength };
  const right = { x: end.x - Math.cos(endAngle + 0.45) * arrowLength, y: end.y - Math.sin(endAngle + 0.45) * arrowLength };
  return {
    curve: `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`,
    arrow: `M ${left.x} ${left.y} L ${end.x} ${end.y} L ${right.x} ${right.y}`,
  };
}

export const GraphEdge = memo(function GraphEdge({ relationship, source, target, highlighted, opacity, palette }: GraphEdgeProps) {
  const geometry = useMemo(() => edgeGeometry(source, target, relationship.id), [source, target, relationship.id]);
  return (
    <Group color={highlighted ? palette.accent : palette.secondary} opacity={opacity} style="stroke" strokeWidth={highlighted ? 1.8 : 1.1} strokeCap="round" strokeJoin="round">
      <Path path={geometry.curve} />
      {relationshipTypeMetadata[relationship.type].directed && <Path path={geometry.arrow} />}
    </Group>
  );
});
