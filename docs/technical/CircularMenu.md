# 🎯 CircularMenu

The root component and orchestrator. About 130 lines of JSX + hook calls. It doesn't do much on its own — its job is to wire the hooks together and render the right things.

**Source:** `src/CircularMenu.tsx`

---

## What It Does

- Resolves the effective theme (`light` or `dark`) from the `theme` prop or the OS `prefers-color-scheme` media query — and watches for live system changes
- Computes per-item arc positions using `mathUtils` based on the arc / carousel configuration
- Delegates open/close state and scroll-lock to `useMenuState`
- In carousel mode, delegates rotation, drag/wheel, momentum and snap to `useCarouselInteraction`
- Lazily injects the SVG liquid-glass filter on first open via `useLiquidGlass`
- Renders a `.menuWrapper` (positioning anchor) containing the toggle `<button>` and one `<MenuItem>` per link

---

## Props

### Core

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `links` | `NavLink[]` | ✅ | The nav items |
| `openIcon` | `ReactNode` | ✅ | Icon inside the toggle button when menu is **closed** |
| `closeIcon` | `ReactNode` | ✅ | Icon inside the toggle button when menu is **open** |
| `renderLink` | `(link: NavLink, props: LinkRenderProps) => ReactNode` | ✅ | Render prop for each pill — spread `props` onto your link |
| `theme` | `'light' \| 'dark'` | — | Override the OS color scheme |

### Arc (static mode)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `angle` | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' \| 'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom-left'` | Shorthand arc preset |
| `startAngle` | `number` | — | Arc start in degrees (0 = right, 90 = bottom). Overrides `angle` |
| `endAngle` | `number` | — | Arc end in degrees. Overrides `angle` |
| `radius` | `number` | `150` | Pixel radius of the arc |

> When `startAngle` / `endAngle` are both provided they take full precedence over `angle`.

### Carousel

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `carousel` | `boolean` | `false` | Enable carousel (full circle) mode |
| `emphasize` | `number \| 'top' \| 'bottom' \| 'left' \| 'right'` | — | Angle (degrees) or named direction of the visual focus point |
| `snap` | `boolean` | `false` | Snap the nearest item to the emphasis point on release |
| `carryMomentum` | `boolean` | `false` | Continue spinning after a fling gesture |
| `introSpin` | `boolean` | `false` | Play a short spin animation when the menu opens |
| `emphasisScale` | `number` | `1` | Scale factor for items near the emphasis point |
| `neutralScale` | `number` | `1` | Scale factor for items opposite the emphasis point. When `<1` a continuous fish-eye gradient is rendered |
| `staggerMs` | `number` | `50` | Milliseconds of delay between sequential item animations |

---

## Operating Modes

### Static Arc (default)

Items fan out along a fixed arc. No dragging, no spinning. Configured with `angle` or `startAngle`/`endAngle`.

### Carousel (`carousel={true}`)

All items distribute around the full 360° ring. User spins the ring by dragging or scroll-wheeling. Optional snap fires when the user lets go.

---

## Emphasis Modes

| Config | What happens |
|--------|-------------|
| `emphasize` only | Focal angle is marked but no scale applied |
| `emphasize` + `emphasisScale` | Items within ±45° of the focus scale up (cosine-smoothed) |
| `emphasize` + `emphasisScale` + `neutralScale < 1` | Continuous gradient — big at focus, small at opposite side, smooth everywhere |

---

## Interaction States

| State | Trigger | CSS |
|-------|---------|-----|
| Closed | Initial or toggle-press while open | Items hidden |
| Opening | Toggle-press | Fan out with stagger |
| Open idle | After open animation | Visible; idle-hint fires after 4 s |
| Dragging | Pointer down + move | Transitions disabled; items follow instantly |
| Momentum | Pointer release with velocity | Exponential decay loop |
| Snapping | End of interaction | Nearest item glides to emphasis angle |
| Closing | Toggle-press while open | Reverse stagger, scroll lock released |

---

## Touch Hardening

The component resists accidental browser interactions on mobile.

### CSS layer

| Property | Purpose |
|----------|---------|
| `touch-action: none` | Prevents browser scroll/zoom from interfering with drag |
| `user-select: none` | No text selection during drag |
| `-webkit-user-drag: none` | No ghost image on Safari drag |
| `-webkit-touch-callout: none` | No iOS long-press context menu |
| `-webkit-tap-highlight-color: transparent` | No tap flash on mobile Chrome/Safari |

### JS layer

| Guard | How |
|-------|-----|
| 5px drag threshold | Ignores micro-jitters and accidental movement on taps |
| `setPointerCapture` | Keeps tracking even when the pointer leaves the element |
| `e.preventDefault()` on move | Suppresses pull-to-refresh and page scroll mid-drag |
| `draggable={false}` + `onDragStart` suppression | Belt-and-suspenders against native HTML drag |

---

## The Liquid Glass Effect

Each menu pill gets an SVG displacement filter applied — it's what gives them that refracted, frosted-glass look. Here's the pipeline:

1. On first open, `useLiquidGlass` checks if the filter SVG already exists in the DOM
2. If not, calls `buildLiquidGlassFilter()` from `utils/liquidGlass.ts`
3. Appends `<svg id="liquid-glass-filter" style="display:none; position:absolute">` to `document.body`
4. The SVG contains `<filter id="liquidGlass">` with: `feTurbulence → feDisplacementMap → feGaussianBlur → feColorMatrix → feComponentTransfer → feComposite`
5. Each `.menuItem` references it via `filter: url(#liquidGlass)`

Built once, reused forever. No cleanup needed.

---

## Animation

### Open / Close

Items animate via CSS transitions on `opacity` and `transform`. Each item gets a `transition-delay` of `index × staggerMs`. Close uses a slightly shorter stagger so folding feels snappier than opening.

### Idle Hint

After 4 seconds of open and stationary, a subtle `idleTwitch` keyframe plays on the ring to invite dragging. Defined in `animations.module.css`.

---

## Scroll Lock

`useMenuState` does these three things when the menu opens to block all background scrolling:

1. `document.body.style.overflow = 'hidden'` — kills window scroll
2. Capturing `wheel` listener with `preventDefault()` — blocks wheel events reaching inner scrollable containers
3. Capturing `touchmove` listener with `preventDefault()` — same for touch

All three are cleaned up on close or unmount. The `{ passive: false }` flag is essential — modern browsers default to passive listeners, making `preventDefault()` a no-op without it.

---

## The Math Corner (for the curious)

### Item Distribution (static arc)

```
angle_i = startAngle + (i / (n - 1)) × (endAngle - startAngle)

x = radius × cos(angle_i)
y = radius × sin(angle_i)
```

### Scale Gradient (fish-eye)

For items at angular distance `θ` from the emphasis point:

```
t = (1 + cos(θ)) / 2          // 1 at focus, 0 at opposite side
scale = neutralScale + t × (emphasisScale − neutralScale)
```

### Snap Algorithm

1. For each item, compute angular distance to the emphasis angle
2. Normalise to `[−180°, 180°]`
3. Pick the item with the smallest `|angularDistance|`
4. Apply `rotation -= angularDistance` over 300ms ease-out
