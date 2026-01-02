# Periospot Color Palette

This document serves as the official color reference for the Periospot project.

## Brand Colors

| Color Name | Hex Code | HSL Value | Usage |
|------------|----------|-----------|-------|
| **Red** | `#e80100` | `0 100% 45%` | Alerts, warnings, destructive actions |
| **Primary Blue** | `#0011ed` | `236 100% 46%` | Primary brand color, CTAs, buttons |
| **Sky Blue** | `#007fed` | `207 100% 46%` | Secondary accents, links |
| **Dark Navy** | `#02011e` | `242 93% 6%` | Dark backgrounds, text |
| **Gold/Yellow** | `#ffc430` | `43 100% 60%` | Highlights, badges, special elements |
| **Medium Blue** | `#045dd5` | `217 96% 42%` | Hover states, secondary buttons |

## Color Swatches

```
🔴 #e80100 - Red (Alerts)
🔵 #0011ed - Primary Blue (Brand)
🩵 #007fed - Sky Blue (Accent)
🌑 #02011e - Dark Navy (Backgrounds)
🟡 #ffc430 - Gold (Highlights)
💙 #045dd5 - Medium Blue (Secondary)
```

## Usage Guidelines

### Primary Blue (#0011ed)
- Main call-to-action buttons (e.g., "GO SHOP")
- Primary interactive elements
- Active states and focus rings
- Brand identity elements

### Sky Blue (#007fed)
- Secondary buttons
- Links and navigation highlights
- Information badges

### Gold (#ffc430)
- Featured content highlights
- Premium/special indicators
- Star ratings and achievements

### Red (#e80100)
- Error messages
- Delete/destructive actions
- Required field indicators

### Dark Navy (#02011e)
- Dark mode backgrounds
- Footer backgrounds
- Text overlays

## Implementation

Colors are defined in `src/index.css` as HSL values and mapped to CSS custom properties:
- `--primary`: Primary brand blue
- `--accent`: Secondary accent color
- `--destructive`: Red for errors/warnings

Always use the semantic token names in components rather than hard-coded hex values.
