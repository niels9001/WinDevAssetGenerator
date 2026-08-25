# Windows developer asset generator

Create consistent Windows developer documentation tiles and blog banners in the browser. The tool supports the Segoe Fluent Icons font, custom SVG artwork, reusable gradient presets, and SVG, PNG, or WebP export.

## Use the generator

Open the [Windows developer asset generator](https://niels9001.github.io/WinDevAssetGenerator/).

1. Choose an asset preset or enter custom dimensions.
2. Search the icon library, use a recommendation, or import an SVG.
3. Adjust the gradient, icon color, size, and position.
4. Download an SVG, PNG, or WebP.

The Segoe Fluent Icons font is included with Windows 11. The generator does not redistribute the font. SVG exports that use a font glyph require Segoe Fluent Icons on the computer that renders them; PNG exports are portable.

## Develop locally

```powershell
npm install
npm run sync-icons
npm run dev
```

The icon catalog is generated from the [official Segoe Fluent Icons documentation](https://learn.microsoft.com/windows/apps/design/iconography/segoe-fluent-icons-font).
