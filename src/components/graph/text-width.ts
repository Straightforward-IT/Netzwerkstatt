import type { SkFont } from '@shopify/react-native-skia';

// Font.measureText is native-only in Skia 2.6; glyph advances also work in the
// CanvasKit development preview and keep our labels centered on both targets.
export function textWidth(font: SkFont, text: string): number {
  return font.getGlyphWidths(font.getGlyphIDs(text)).reduce((total, width) => total + width, 0);
}
