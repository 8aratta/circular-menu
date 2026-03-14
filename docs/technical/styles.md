# 🎨 Styles

Four CSS Module files. Vite bundles them down to one `dist/circular-menu.css` at build time — no runtime style injection, no CSS-in-JS, just a plain stylesheet that you import once.

```ts
import '@8aratta/circular-menu/dist/circular-menu.css';
```

---

## base.module.css

Positioning for the wrapper and the circular container.

### Classes

| Class | Element | Description |
|-------|---------|-------------|
| `.menuWrapper` | `<div>` | `position: relative; display: inline-flex` — the positioning anchor |
| `.circularMenu` | `<div>` | `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)` — centred over the wrapper |
| `.circularMenuOpen` | Same | Applied while `isOpen` is true; triggers item fan-out |

### Touch guards on `.circularMenu`

```css
touch-action: none;
user-select: none;
-webkit-user-drag: none;
```

---

## button.module.css

The hamburger/close toggle button.

### Classes

| Class | Element | Description |
|-------|---------|-------------|
| `.menuButton` | `<button>` | Circular button, flex container |
| `.menuButtonOpen` | Same | Applied when open — can alter background |
| `.menuIcon` | `<span>` | Flex wrapper around the `openIcon` / `closeIcon` ReactNode |

### Theme variants

```css
[data-theme='light'] .menuButton { background: rgba(255, 255, 255, 0.7); }
[data-theme='dark']  .menuButton { background: rgba(30, 30, 30, 0.7);   }
```

`data-theme` is set on `.menuWrapper` by the component. Everything inside can key off it.

---

## menuItem.module.css

The most interesting file. Styles the individual nav pills — glass layers, positioning, states, and theming.

### Classes

| Class | Element | Description |
|-------|---------|-------------|
| `.menuItem` | `<li>` | Positioned absolute; applies `filter: url(#liquidGlass)` |
| `.menuItemOpen` | Same | Fades and scales in — `opacity: 1; transform: scale(1)` |
| `.menuLink` | `renderLink` wrapper | `display: flex; flex-direction: column; align-items: center` |
| `.iconContainer` | `<div>` | Circular icon wrapper; size from CSS custom prop |
| `.iconWrapper` | `<span>` | Inner flex wrapper for the icon ReactNode |
| `.label` | `<span>` | The text label |

### CSS Custom Properties

Set inline on each item by `MenuItem`:

| Property | What it does |
|----------|--------------|
| `--item-x` | Cartesian x offset from the menu centre (px) |
| `--item-y` | Cartesian y offset from the menu centre (px) |
| `--item-scale` | Scale factor from emphasis calculation |
| `--stagger-delay` | `index × staggerMs` — staggers the open/close animation |

### Pseudo-elements

| Selector | Purpose |
|----------|---------|
| `.menuItem::before` | The frosted glass background layer |
| `.menuItem::after` | Subtle highlight ring for the glass edge |
| `.iconContainer::before` | Inner glow on the icon circle |
| `::before` and `::after` both | `pointer-events: none` — glass layers never eat clicks |

### Interaction states

| State | CSS class | Transition behaviour |
|-------|-----------|---------------------|
| Open (default) | `.menuItemOpen` | Normal spring with stagger delay |
| Dragging | `.menuItemOpen.interacting` | All transitions **disabled** — items follow pointer instantly |
| Snapping | `.menuItemOpen.snapping` | Smooth 0.4s spring ease — the satisfying settle |

This three-state split is what makes the carousel feel right. No transition lag while dragging; buttery snap on release.

### Theme variants

```css
[data-theme='light'] .menuItem::before { /* light glass */ }
[data-theme='dark']  .menuItem::before { /* dark glass */  }
```

### Z-index layers

| Layer | z-index | Notes |
|-------|---------|-------|
| `.menuItem` | `1` | Above the wrapper |
| `.menuItem` hovered | `10` | Rises above siblings |
| Toggle button | `20` | Always on top |

---

## animations.module.css

Just one animation. But it's a good one.

### `idleTwitch`

A subtle wobble that plays on the ring after 4 s of inactivity:
@keyframes idleTwitch {
  0%   { transform: translate(-50%, -50%) rotate(0deg);   }
  15%  { transform: translate(-50%, -50%) rotate(3deg);   }
  30%  { transform: translate(-50%, -50%) rotate(-2deg);  }
  45%  { transform: translate(-50%, -50%) rotate(1.5deg); }
  60%  { transform: translate(-50%, -50%) rotate(-1deg);  }
  100% { transform: translate(-50%, -50%) rotate(0deg);   }
}
```

Duration: 0.8 s, `ease-in-out`, plays once. The message: *hey, you can spin this thing.*
