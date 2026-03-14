# 🎯 CircularMenu

The root component and orchestrator. About 130 lines of JSX + hook calls. It doesn't do much on its own — its job is to wire the hooks together and render the right things.

**Source:** `src/CircularMenu.tsx`

---

## What It Does

- Resolves the effective theme (`light` or `dark`) from the `theme` prop or the OS `prefers-color-scheme` media query — and watches for live system changes
- Computes per-item arc positions using `mathUtils` based on the arc / carousel configuration
- Delegates open/close state and scroll-lock to `useMenuState`
- In carousel mode, delegates rotation, drag/wheel, momentum and snap to `useCarouselInteraction`
- Injects structural CSS defaults into `<head>` on first mount via `injectStructuralStyles()`
- Renders a `[data-circular-menu]` root div containing the toggle `<button>` and one `<MenuItem>` per link

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

| State | Trigger | Class on `.circular-menu-item` |
|-------|---------|--------------------------------|
| Closed | Initial or toggle-press while open | (no `--open`) |
| Opening | Toggle-press | `--open` added |
| Open idle | After open animation | `--open`; idle-hint fires after 4 s |
| Dragging | Pointer down + move | `--open --interacting` |
| Momentum | Pointer release with velocity | `--open --interacting` |
| Snapping | End of interaction | `--open --snapping` |
| Closing | Toggle-press while open | `--open` removed with reverse stagger |

---

## Touch Hardening

The component resists accidental browser interactions on mobile.

### Inline styles

| Property | Purpose |
|----------|--------|
| `touchAction: 'none'` on overlay | Prevents browser scroll/zoom from interfering with drag |
| `userSelect: 'none'` on items | No text selection during drag |
| `WebkitTapHighlightColor: 'transparent'` on items | No tap flash on mobile Chrome/Safari |

### JS layer

| Guard | How |
|-------|-----|
| 5px drag threshold | Ignores micro-jitters and accidental movement on taps |
| `setPointerCapture` | Keeps tracking even when the pointer leaves the element |
| `e.preventDefault()` on move | Suppresses pull-to-refresh and page scroll mid-drag |
| `draggable={false}` + `onDragStart` suppression | Belt-and-suspenders against native HTML drag |


## Animation

### Open / Close

Items animate via inline `transition` on `opacity` and `transform`. Each item gets a `transitionDelay` of `index × staggerMs`. Close uses a slightly shorter stagger so folding feels snappier than opening. During drag, all transitions are set to `'none'` so items follow the pointer instantly. After a drag, `--snapping` is set and a smooth 0.4s spring ease kicks in.

### Idle Hint

After 4 seconds of open and stationary, the `circular-menu-idle-twitch` keyframe plays on the nearest-to-emphasis item. The animation name is defined in the auto-injected stylesheet (see `injectStructuralStyles`). Defined as the `animation` property in the inline style of `MenuItem` when `showIdleHint` is true.

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
