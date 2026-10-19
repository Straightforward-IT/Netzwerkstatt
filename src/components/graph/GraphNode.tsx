import { memo, useMemo } from 'react';
import { Circle, Group, Path, Text, type SkFont } from '@shopify/react-native-skia';
import type { SharedValue } from 'react-native-reanimated';

import { NODE_RADIUS } from '../../services/graph-math';
import { getPersonInitials, getPersonName, type Category, type GraphNode as NodePosition, type Person } from '../../types/network';
import type { Theme } from '../../theme/tokens';
import { textWidth } from './text-width';

interface GraphNodeProps {
  person: Person;
  position: NodePosition;
  categories: Category[];
  selected: boolean;
  opacity: number;
  palette: Theme;
  initialFont: SkFont | null;
  labelFont: SkFont | null;
  detailFont: SkFont | null;
  initialTransform: SharedValue<Array<{ scale: number }>>;
  labelTransform: SharedValue<Array<{ scale: number }>>;
  labelOpacity: SharedValue<number>;
  detailOpacity: SharedValue<number>;
}

const shorten = (value: string, length: number) => value.length > length ? `${value.slice(0, length - 1)}…` : value;

function fitLabel(font: SkFont | null, value: string, maxWidth: number): string {
  if (!font || textWidth(font, value) <= maxWidth) return value;
  const characters = Array.from(value);
  while (characters.length > 1 && textWidth(font, `${characters.join('')}…`) > maxWidth) characters.pop();
  return `${characters.join('')}…`;
}

function categoryArc(index: number, count: number, radius: number) {
  const gap = 0.12;
  const start = (index / count) * Math.PI * 2 - Math.PI / 2 + gap;
  const end = ((index + 1) / count) * Math.PI * 2 - Math.PI / 2 - gap;
  return `M ${Math.cos(start) * radius} ${Math.sin(start) * radius} A ${radius} ${radius} 0 ${end - start > Math.PI ? 1 : 0} 1 ${Math.cos(end) * radius} ${Math.sin(end) * radius}`;
}

export const GraphNode = memo(function GraphNode({
  person, position, categories, selected, opacity, palette,
  initialFont, labelFont, detailFont, initialTransform, labelTransform, labelOpacity, detailOpacity,
}: GraphNodeProps) {
  const initials = getPersonInitials(person);
  const name = person.isSelf ? 'Dein Mittelpunkt' : fitLabel(labelFont, shorten(person.firstName || person.nickname || getPersonName(person), 18), selected ? 120 : 64);
  const detail = shorten(person.skills[0] || categories[0]?.name || person.city || '', 22);
  const rings = useMemo(() => categories.map((category, index) => ({
    color: category.color,
    path: categoryArc(index, categories.length, NODE_RADIUS + 3),
  })), [categories]);

  return (
    <Group transform={[{ translateX: position.x }, { translateY: position.y }]} opacity={opacity}>
      {selected && <Circle r={39} color={palette.accent} opacity={0.1} />}
      {person.isSelf && <Circle r={40} color={palette.accent} opacity={0.06} />}
      {selected && <Circle r={34} color={palette.accent} style="stroke" strokeWidth={1.3} />}
      <Circle cx={0} cy={2} r={NODE_RADIUS + 1} color={palette.text} opacity={0.045} />
      <Circle r={person.isSelf ? NODE_RADIUS + 3 : NODE_RADIUS} color={person.isSelf ? palette.accent : palette.surface} />
      {!person.isSelf && categories.length === 0 && <Circle r={NODE_RADIUS + 3} color={palette.border} style="stroke" strokeWidth={2} />}
      {!person.isSelf && categories.length === 1 && <Circle r={NODE_RADIUS + 3} color={categories[0]?.color ?? palette.border} style="stroke" strokeWidth={2} />}
      {!person.isSelf && categories.length > 1 && rings.map((ring, index) => (
        <Path key={`${person.id}-ring-${index}`} path={ring.path} color={ring.color} style="stroke" strokeWidth={2} strokeCap="round" />
      ))}
      {initialFont && (
        <Group transform={initialTransform}>
          <Text
            text={initials}
            font={initialFont}
            x={-textWidth(initialFont, initials) / 2}
            y={5.5}
            color={person.isSelf ? palette.onAccent : palette.text}
          />
        </Group>
      )}
      {person.favorite && !person.isSelf && (
        <Group>
          <Circle cx={20} cy={-20} r={5.5} color={palette.surface} />
          <Circle cx={20} cy={-20} r={3} color="#BF9861" />
        </Group>
      )}
      {labelFont && (
        <Group opacity={selected || person.isSelf ? 1 : labelOpacity} transform={[{ translateY: NODE_RADIUS + 7 }]}>
          <Group transform={labelTransform}>
            <Text text={name} font={labelFont} x={-textWidth(labelFont, name) / 2} y={12} color={palette.text} />
          </Group>
        </Group>
      )}
      {detailFont && !!detail && (
        <Group opacity={detailOpacity}>
          <Text text={detail} font={detailFont} x={-textWidth(detailFont, detail) / 2} y={62} color={palette.secondary} />
        </Group>
      )}
    </Group>
  );
});
