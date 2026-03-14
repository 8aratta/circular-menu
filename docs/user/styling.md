# 🖌️ Styling

The component ships with zero visual opinions — no colours, no backgrounds, no borders. The injected defaults handle structure (pill shape, sizing, spacing, animation keyframes) and get out of the way. Everything else is yours.

---

## How the defaults work

On first mount, `CircularMenu` injects one `<style data-circular-menu-styles>` tag into `<head>`. This gives you sensible structural defaults — pill border-radius, font size, padding, button sizing — without you importing anything. It fires once and is idempotent; multiple menu instances on the same page don't double-inject.

**You don't need to import a stylesheet.** That's it.

---

## What you can target

### Attribute selectors

| Selector | What it targets |
|----------|----------------|
| `[data-circular-menu]` | Root wrapper div |
| `[data-circular-menu][data-theme="dark"]` | Root in dark mode |
| `[data-circular-menu][data-theme="light"]` | Root in light mode |
| `[data-circular-menu][data-open="true"]` | Root when menu is open |
| `[data-circular-menu][data-open="false"]` | Root when menu is closed |
| `[data-circular-menu-toggle]` | The open/close button |
| `[data-circular-menu-icon="open"]` | Icon shown when closed |
| `[data-circular-menu-icon="close"]` | Icon shown when open |
| `[data-circular-menu-overlay]` | Full-screen backdrop overlay |

### BEM classes (on each pill)

| Class | When present |
|-------|-------------|
| `.circular-menu-item` | Always (base pill styles) |
| `.circular-menu-item--open` | Menu is open |
| `.circular-menu-item--interacting` | User is dragging |
| `.circular-menu-item--snapping` | Snap animation in progress |
| `.circular-menu-item--emphasized` | Item is at the emphasis angle |
| `.circular-menu-item--idle-hint` | Idle-hint animation playing |

### CSS custom properties (on each pill)

These are set inline by the component and are valid inside any CSS rule targeting `.circular-menu-item`.

| Property | Value | Use for |
|----------|-------|---------|
| `--tx` | px string | Horizontal translation from centre — composing hover transforms |
| `--ty` | px string | Vertical translation from centre — composing hover transforms |
| `--scale-factor` | number | Current emphasis multiplier — composing hover scale |
| `--open-delay` | ms string | Stagger delay for open animation |
| `--close-delay` | ms string | Stagger delay for close animation |

---

## Don't touch these

The component sets `transform`, `opacity`, `transition`, and `animation` as **inline styles** on each pill. Inline styles always win specificity. Don't try to override them with CSS — the JS owns them and will override you every render.

The one safe exception is `:hover`, because you're reacting to user interaction the JS doesn't track. The injected sheet already has a hover rule using `--tx`, `--ty`, and `--scale-factor`. If you write your own, use the same vars:

```css
/* safe — compose with the JS-managed values */
.circular-menu-item--open:hover {
  transform: translate(var(--tx), var(--ty)) scale(calc(var(--scale-factor, 1) * 1.12));
}
```

---

## Examples

### Give the pills a background

```css
.circular-menu-item {
  background: rgba(20, 20, 20, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
```

### Different background per theme

```css
[data-circular-menu][data-theme="dark"]  .circular-menu-item {
  background: rgba(20, 20, 20, 0.85);
  color: #fff;
}

[data-circular-menu][data-theme="light"] .circular-menu-item {
  background: rgba(255, 255, 255, 0.85);
  color: #111;
}
```

### Add a border

```css
.circular-menu-item {
  border: 1px solid rgba(255, 255, 255, 0.15);
}
```

### Rounded square pills instead of capsule

```css
.circular-menu-item {
  border-radius: 12px;
}
```

### Style the toggle button

```css
[data-circular-menu-toggle] {
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  color: white;
}
```

### Show something different on open

```css
[data-circular-menu][data-open="true"] [data-circular-menu-toggle] {
  background: rgba(255, 80, 80, 0.8);
}
```

### Darken the overlay

```css
[data-circular-menu-overlay] {
  background: rgba(0, 0, 0, 0.5);
}
```

### Custom hover — bigger scale nudge

```css
.circular-menu-item--open:hover {
  transform: translate(var(--tx), var(--ty)) scale(calc(var(--scale-factor, 1) * 1.15)) !important;
}
```

The `!important` is needed because the injected hover rule also has it. Your rule needs to win specificity.

### Emphasised item stands out

```css
.circular-menu-item--emphasized {
  background: rgba(255, 255, 255, 0.95);
  color: #000;
  font-weight: 700;
}
```

### Liquid glass — add it back

The glass effect was removed from the defaults so you can do it yourself if you want it. Hook up an SVG filter and the `::before` pseudo-element:

```css
/* 1. Inject the SVG filter somewhere in your app */
/*    (body, a hidden div, wherever — just once) */

/* 2. Apply it to the pills */
.circular-menu-item {
  filter: url(#myGlassFilter);
  background: transparent;
  overflow: hidden;
}

.circular-menu-item::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  backdrop-filter: blur(12px) saturate(1.4);
  -webkit-backdrop-filter: blur(12px) saturate(1.4);
  background: rgba(255, 255, 255, 0.08);
  pointer-events: none;
}
```

### Change font

```css
.circular-menu-item {
  font-family: 'Your Font', sans-serif;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-size: 0.75rem;
}
```

---

## Scoping to one instance

If you have multiple menus on the page and only want to style one, wrap it in a container and add a class to the `nav`:

```tsx
<nav className="my-nav">
  <CircularMenu ... />
</nav>
```

```css
.my-nav [data-circular-menu-toggle] {
  background: #1a1a2e;
}

.my-nav .circular-menu-item {
  background: #16213e;
  color: #e94560;
}
```
