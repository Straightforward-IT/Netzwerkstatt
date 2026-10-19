import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/tokens';

export function IconButton({ icon, label, onPress, active = false }: {
  icon: ComponentProps<typeof Feather>['name']; label: string; onPress: () => void; active?: boolean;
}) {
  const theme = useTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: active }}
    onPress={onPress} style={({ pressed }) => [styles.button, { backgroundColor: active ? theme.accentSoft : theme.surface, borderColor: theme.border, opacity: pressed ? 0.65 : 1 }]}>
    <Feather name={icon} size={20} color={theme.accent} />
  </Pressable>;
}
const styles = StyleSheet.create({ button: { width: 46, height: 46, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' } });
