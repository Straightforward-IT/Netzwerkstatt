import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fonts, useTheme } from '../../theme/tokens';
import { Category, getPersonInitials, Person } from '../../types/network';

export interface PersonAvatarProps {
  person: Person;
  categories: Category[];
  size?: number;
}

/** Category colours remain visible even when no profile photo has been added. */
export function PersonAvatar({ person, categories, size = 48 }: PersonAvatarProps) {
  const theme = useTheme();
  const personCategories = person.categoryIds
    .map((categoryId) => categories.find((category) => category.id === categoryId))
    .filter((category): category is Category => Boolean(category));
  const ringColors = personCategories.length
    ? personCategories.slice(0, 3).map((category) => category.color)
    : [theme.border];
  const ringStep = size >= 64 ? 4 : 3;
  const innerInset = ringColors.length * ringStep + 2;

  return (
    <View accessible={false} style={{ width: size, height: size, flexShrink: 0 }}>
      {ringColors.map((color, index) => (
        <View
          key={`${color}-${index}`}
          style={[
            styles.ring,
            {
              top: index * ringStep,
              right: index * ringStep,
              bottom: index * ringStep,
              left: index * ringStep,
              borderColor: color,
              borderWidth: size >= 64 ? 2 : 1.5,
            },
          ]}
        />
      ))}
      <View
        style={[
          styles.center,
          {
            top: innerInset,
            right: innerInset,
            bottom: innerInset,
            left: innerInset,
            backgroundColor: person.isSelf ? theme.accent : theme.accentSoft,
          },
        ]}
      >
        <Text
          maxFontSizeMultiplier={1.3}
          style={{
            color: person.isSelf ? theme.onAccent : theme.accent,
            fontFamily: fonts.bold,
            fontSize: size * (person.isSelf ? 0.21 : 0.27),
          }}
        >
          {getPersonInitials(person)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { position: 'absolute', borderRadius: 999 },
  center: { position: 'absolute', borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
});
