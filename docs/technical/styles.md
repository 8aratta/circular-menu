# 🎨 Styles

No CSS file. No stylesheet import. The component ships zero CSS at build time and takes care of its own structural defaults automatically.

---

## How It Works

`CircularMenu` calls `injectStructuralStyles()` in a one-time `useEffect` on first mount. That function writes a single `<style data-circular-menu-styles>` tag into `<head>`. It's idempotent — if the tag already exists (e.g. SSR hydration, HMR re-mount) it's a no-op.

**Source:** `src/utils/injectStyles.ts`

---

## What Gets Injected

The injected stylesheet covers structural defaults that can't live as inline styles — anything that uses pseudo-selectors, `@keyframes`, `:hover`, or media queries.

### Pill defaults

```css
.circular-menu-item {
  display: flex;
  align-items: center;
  padding: 0.55rem 1.2rem;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1;
  color: #fff;
  white-space: nowrap;
  cursor: pointer;
}
```

### Light theme text

```css
[data-theme="light"] .circular-menu-item {
  color: #000;
}
```

### Hover scale nudge

```css
.circular-menu-item--open:hover {
  transform: translate(var(--tx), var(--ty)) scale(calc(var(--scale-factor, 1) * 1.08)) !important;
}
```

The `!important` is intentional — inline `transform` from JS would otherwise win the specificity battle.

### Toggle button sizing

```css
[data-circular-menu-toggle] {
  width: 44px;
  height: 44px;
}

[data-circular-menu-toggle] > div {
  width: 40px;
  height: 40px;
}
```

### Icon fill rules

```css
[data-circular-menu-icon] {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
```

### Overlay touch-action (carousel mode)

```css
[data-circular-menu-overlay][data-carousel] {
  touch-action: none;
}

[data-circular-menu-overlay]:active {
  cursor: grabbing;
}
```

### Idle-hint keyframe

```css
@keyframes circular-menu-idle-twitch {
  0%   { transform: translate(var(--tx), var(--ty)) scale(var(--scale-factor, 1)); }
  20%  { transform: translate(var(--tx), var(--ty)) scale(var(--scale-factor, 1)) rotate(6deg); }
  40%  { transform: translate(var(--tx), var(--ty)) scale(var(--scale-factor, 1)) rotate(-4deg); }
  60%  { transform: translate(var(--tx), var(--ty)) scale(var(--scale-factor, 1)) rotate(2deg); }
  80%  { transform: translate(var(--tx), var(--ty)) scale(var(--scale-factor, 1)) rotate(-1deg); }
  100% { transform: translate(var(--tx), var(--ty)) scale(var(--scale-factor, 1)); }
}
```

### Media queries

```css
@media (max-width: 768px) {
  .circular-menu-item { padding: 0.5rem 1rem; font-size: 0.85rem; }
}

@media (max-width: 480px) {
  .circular-menu-item { padding: 0.45rem 0.85rem; font-size: 0.8rem; }
}
```

---

## What Stays Inline

Anything that needs to update per-frame or per-item lives as inline styles on the React elements — not in the injected sheet. These are **not** yours to override; JS owns them.

| Property | Set on | Updated by |
|----------|--------|-----------|
| `transform` | `.circular-menu-item` | JS (carousel rotation, open/close) |
| `opacity` | `.circular-menu-item` | JS (open/close fade) |
| `transition` / `transitionDelay` | `.circular-menu-item` | JS (disabled during drag, active on snap) |
| `animation` | `.circular-menu-item` | JS (idle-twitch toggle) |
| `opacity` on icon spans | `[data-circular-menu-icon]` | JS (open/close crossfade) |
| `transform` on icon spans | `[data-circular-menu-icon]` | JS (spring crossfade) |
| `opacity` + `pointerEvents` on overlay | `[data-circular-menu-overlay]` | JS (show/hide) |

---

## CSS Custom Properties

These are set inline on each `.circular-menu-item` by `MenuItem.tsx`. They're the bridge between JS-computed positions and your CSS overrides.

| Property | Type | Description |
|----------|------|-------------|
| `--tx` | `px` string | Horizontal translation from centre |
| `--ty` | `px` string | Vertical translation from centre |
| `--scale-factor` | number | Current emphasis scale multiplier |
| `--open-delay` | `ms` string | Stagger delay for the open animation |
| `--close-delay` | `ms` string | Stagger delay for the close animation |

The hover rule uses `--tx`, `--ty`, and `--scale-factor` so the extra scale nudge composes cleanly with the JS-computed values.

---

## Selector Reference

Everything exposed for consumer CSS. See [user/styling.md](../user/styling.md) for usage examples.

### Attribute selectors

| Selector | What it targets |
|----------|----------------|
| `[data-circular-menu]` | Root wrapper div |
| `[data-circular-menu][data-theme="dark"]` | Root in dark mode |
| `[data-circular-menu][data-theme="light"]` | Root in light mode |
| `[data-circular-menu][data-open="true"]` | Root when menu is open |
| `[data-circular-menu][data-open="false"]` | Root when menu is closed |
| `[data-circular-menu-toggle]` | The open/close button |
| `[data-circular-menu-icon="open"]` | Icon span shown when closed |
| `[data-circular-menu-icon="close"]` | Icon span shown when open |
| `[data-circular-menu-overlay]` | The backdrop overlay |

### BEM classes (on each pill)

| Class | When present |
|-------|-------------|
| `.circular-menu-item` | Always (base styles) |
| `.circular-menu-item--open` | Menu is open |
| `.circular-menu-item--interacting` | User is dragging |
| `.circular-menu-item--snapping` | Post-drag snap animation |
| `.circular-menu-item--emphasized` | Item is at the emphasis angle |
| `.circular-menu-item--idle-hint` | Idle-hint animation is playing |

---

## What Was Removed

The old package had CSS Module files with default visual styles (backgrounds, rgba tints, `::before`/`::after` layers). All of that is gone. You get clean, unstyled pills — add your own backgrounds, borders, and effects however you like.

