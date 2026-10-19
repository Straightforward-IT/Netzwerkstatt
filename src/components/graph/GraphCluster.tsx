import { memo } from 'react';
import { Circle, DashPathEffect, Group, Text, type SkFont } from '@shopify/react-native-skia';
import type { SharedValue } from 'react-native-reanimated';

import type { Category, GraphCluster as ClusterPosition } from '../../types/network';
import { textWidth } from './text-width';

interface GraphClusterProps {
  category: Category;
  position: ClusterPosition;
  radius: number;
  count: number;
  opacity: number;
  font: SkFont | null;
  labelTransform: SharedValue<Array<{ scale: number }>>;
}

export const GraphCluster = memo(function GraphCluster({ category, position, radius, count, opacity, font, labelTransform }: GraphClusterProps) {
  const label = `${category.name.toLocaleUpperCase('de-DE')}  ·  ${count}`;
  return (
    <Group transform={[{ translateX: position.x }, { translateY: position.y }]} opacity={opacity}>
      <Circle r={radius} color={category.color} opacity={0.035} />
      <Circle r={radius} color={category.color} opacity={0.25} style="stroke" strokeWidth={0.8}>
        <DashPathEffect intervals={[3, 7]} />
      </Circle>
      {font && (
        <Group transform={[{ translateY: -radius - 16 }]}>
          <Group transform={labelTransform}>
            <Text text={label} font={font} x={-textWidth(font, label) / 2} y={0} color={category.color} />
          </Group>
        </Group>
      )}
    </Group>
  );
});
