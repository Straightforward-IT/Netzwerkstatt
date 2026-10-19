import { useColorScheme } from 'react-native';

export const palettes = {
  light: {
    background: '#F6F7F3', surface: '#FFFFFF', surfaceMuted: '#ECEFE8',
    text: '#20392F', secondary: '#68796F', border: '#E0E6DD',
    accent: '#315C47', accentSoft: '#E3ECDF', onAccent: '#FFFFFF',
    danger: '#A13E3E', backdrop: 'rgba(20, 39, 29, 0.28)',
  },
  dark: {
    background: '#14231E', surface: '#1D3028', surfaceMuted: '#293E33',
    text: '#E9F0E7', secondary: '#A7B7AB', border: '#344A3E',
    accent: '#AAD1AF', accentSoft: '#304F3B', onAccent: '#14231E',
    danger: '#E9A3A3', backdrop: 'rgba(0, 0, 0, 0.45)',
  },
};

export const fonts = { regular: 'Manrope_400Regular', medium: 'Manrope_500Medium', semiBold: 'Manrope_600SemiBold', bold: 'Manrope_700Bold' };
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 10, md: 16, lg: 24, pill: 999 };
export type Theme = typeof palettes.light;
export function useTheme() { return palettes[useColorScheme() === 'dark' ? 'dark' : 'light']; }
