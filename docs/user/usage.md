# ⚙️ Usage

Everything you need to configure the menu — from the simplest arc to a full physics-driven carousel.

---

## The `renderLink` Prop

This is the big one. Instead of hardcoding react-router-dom, the component calls *your* function for every nav item. You give it a link element; it gives it the positioning, styling, and event handlers it needs to work.

```tsx
renderLink={(link, linkProps) => (
  <Link to={link.to} {...linkProps}>{link.label}</Link>
)}
```

**Always spread `linkProps` onto your element.** It contains:

- `ref` \u2014 for position measurement
- `className` \u2014 applies the menu item styles
- `style` \u2014 CSS custom properties (`--tx`, `--ty`, `--scale-factor`, etc.) for positioning
- `draggable: false` + `onDragStart` \u2014 disables native drag jank
- `onClick`, `onPointerDown/Move/Up/Cancel` \u2014 carousel and tap handlers

Skip any of these and things will visually break or feel off.

### Full `LinkRenderProps` type

```ts
interface LinkRenderProps {
  ref: React.Ref<HTMLAnchorElement>;
  className: string;
  style: React.CSSProperties;        // --tx, --ty, --scale-factor, --open-delay, --close-delay
  draggable: false;
  onClick: (e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent) => void;
  onPointerDown?: (e: React.PointerEvent<HTMLElement>) => void;
  onPointerMove?: (e: React.PointerEvent<HTMLElement>) => void;
  onPointerUp?: (e: React.PointerEvent<HTMLElement>) => void;
  onPointerCancel?: (e: React.PointerEvent<HTMLElement>) => void;
}
```

---

## Theming

`prefers-color-scheme` is detected automatically and updates live if the user switches their system theme. Override it whenever you need to with the `theme` prop:

```tsx
<CircularMenu theme="dark" ... />
<CircularMenu theme="light" ... />
```

This sets a `data-theme` attribute on the component's root element, which the bundled CSS uses to switch between dark and light pill styles. If you need deeper theme customisation, the CSS custom properties `--tx`, `--ty`, and `--scale-factor` are on each item, and you can override the `::before` / `::after` pseudo-element styles from your own stylesheet by layering on `[data-theme] .someClass`.

---

## Arc configuration

### Shorthand — `angle`

Set the **center** of the arc. A ±45° spread is applied automatically.

| Value | Arc center | Arc spans |
|-------|-----------|-----------|
| `'bottom'` / `270` | Straight down | 225° – 315° |
| `'left'` / `180` | Straight left | 135° – 225° |
| `'top'` / `90` | Straight up | 45° – 135° |
| `'right'` / `0` | Straight right | 315° – 45° |
| Any `number` | That angle | ±45° around it |

Default is `225` (bottom-left corner).

### Manual — `startAngle` / `endAngle`

For full control, set explicit angles (degrees, counter-clockwise from 3 o'clock):

```tsx
<CircularMenu startAngle={180} endAngle={270} ... />
```

These override `angle` when provided.

---

## All props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `links` | `NavLink[]` | **required** | Array of `{ to: string; label: string }` |
| `renderLink` | `(link: NavLink, props: LinkRenderProps) => ReactNode` | **required** | Render function for each item — spread `props` onto your link |
| `openIcon` | `ReactNode` | **required** | Icon shown when the menu is closed |
| `closeIcon` | `ReactNode` | **required** | Icon shown when the menu is open |
| `theme` | `'light' \| 'dark'` | OS preference | Override the color theme |
| `radius` | `number` | `130` | Arc radius in px |
| `angle` | `number \| 'top' \| 'right' \| 'bottom' \| 'left' \| 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | `'bottom-left'` | Arc center (±45° spread applied) |
| `startAngle` | `number` | — | Manual arc start (overrides `angle`) |
| `endAngle` | `number` | — | Manual arc end (overrides `angle`) |
| `staggerMs` | `number` | `50` | Open/close animation delay between items (ms) |
| `carousel` | `boolean` | `false` | Enable 360° draggable carousel mode |
| `emphasize` | `number \| 'top' \| 'right' \| 'bottom' \| 'left'` | — | Focal angle — scale items up as they approach it |
| `snap` | `boolean` | `false` | Snap nearest item to the emphasis angle on interaction end |
| `emphasisScale` | `number` | — | Scale factor at the focus (e.g. `1.33`) |
| `neutralScale` | `number` | — | Scale factor at 180° opposite — enables continuous fish-eye interpolation |
| `carryMomentum` | `boolean` | `false` | Physics-based spin-down: slow drags snap quickly, fast flings coast |
| `introSpin` | `boolean` | `false` | One-time flourish spin on first open |

---

## Carousel Mode

Turn the static arc into a full 360° ring that users can spin. Drag, flick, or scroll-wheel to rotate items; tap to navigate.

```tsx
<CircularMenu
  links={links}
  openIcon={<HamburgerIcon />}
  closeIcon={<CloseIcon />}
  renderLink={(link, props) => <Link to={link.to} {...props}>{link.label}</Link>}
  carousel
  emphasize="bottom"
  snap
  carryMomentum
  emphasisScale={1.33}
  neutralScale={0.75}
/>
```

- Drag anywhere — on the overlay *or* directly on a pill
- Scroll wheel also rotates (page scroll is locked while the menu is open)
- Drag clicks are suppressed so you never accidentally navigate mid-spin
- Touch on mobile works exactly like desktop drag — identical pointer handlers

### Emphasis Modes

| Configuration | Effect |
|---------------|--------|
| `emphasize` only | Marks a focal angle (no visible scaling) |
| `emphasize` + `emphasisScale` | Items within ±45° of the focus scale up (cosine-smoothed) |
| `emphasize` + `emphasisScale` + `neutralScale` | All items interpolate continuously — large at focus, small at 180° opposite |

### Idle Hint

When `emphasize` is set, the closest item plays a subtle jiggle (`idleTwitch`) after 4 seconds of inactivity. Built-in, no config needed — a quiet invitation to drag.
