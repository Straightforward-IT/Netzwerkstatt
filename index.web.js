// Development preview only. Native Android loads Skia directly.
// Load local CanvasKit before Router evaluates any canvas imports.
import '@expo/metro-runtime';
import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

LoadSkiaWeb({ locateFile: (file) => `/${file}` })
  .then(() => { require('expo-router/entry'); })
  .catch((error) => {
    console.error('Skia preview could not start', error);
    document.body.textContent = 'Die Graph-Vorschau konnte nicht geladen werden. Bitte lade die Seite neu.';
  });
