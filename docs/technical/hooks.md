# 🪝 Hooks

Two hooks. Each one owns exactly one concern and doesn't touch the others.

---

## useMenuState

**Source:** `src/hooks/useMenuState.ts`

Open/close state and body scroll-lock. That's all this hook does.

### Signature

```ts
function useMenuState(): {
  isOpen: boolean;
  toggle: () => void;
}
```

### What It Does

| Action | Effect |
|--------|--------|
| `toggle()` while closed | `isOpen → true`, saves current `body.overflow`, sets it to `'hidden'` |
| `toggle()` while open | `isOpen → false`, restores `body.overflow` to saved value |
| Component unmounts while open | Overflow is restored via `useEffect` cleanup |

The saved overflow value is stored in a `ref` so it doesn't trigger re-renders. This also means if the app had `overflow: hidden` already set (e.g. another modal open), it gets correctly restored instead of blindly reset to `''`.

### No Router Coupling

No `useLocation`, no route-change listeners. None. To auto-close on navigation, put `key={location.pathname}` on `<CircularMenu>` — React will unmount-remount the component (and this hook) on every navigation.

---

## useCarouselInteraction

**Source:** `src/hooks/useCarouselInteraction.ts`

Everything carousel — pointer drag, scroll wheel, momentum coasting, and snap. This is the big one.

### Signature

```ts
function useCarouselInteraction(options: CarouselInteractionOptions): {
  rotation: number;
  itemTransforms: ItemTransform[];
  handlers: PointerHandlers;
}
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `itemCount` | `number` | — | How many items are on the ring |
| `emphasize` | `number` | — | Emphasis angle in degrees |
| `snap` | `boolean` | `false` | Snap on release |
| `carryMomentum` | `boolean` | `false` | Coast to a stop after a fling |
| `introSpin` | `boolean` | `false` | Spin flourish on mount |
| `emphasisScale` | `number` | `1` | Scale at the focal angle |
| `neutralScale` | `number` | `1` | Scale at the opposite side |
| `isOpen` | `boolean` | — | Hook is only active while the menu is open |

### Returns

| Key | Type | Description |
|-----|------|-------------|
| `rotation` | `number` | Current ring rotation in degrees |
| `itemTransforms` | `ItemTransform[]` | Per-item `{ scale, opacity, zIndex }` based on current rotation |
| `handlers` | `PointerHandlers` | `onPointerDown/Move/Up/Cancel` + `onWheel` — spread onto the container |

### How It Works

**Drag detection** — uses `setPointerCapture` so tracking continues outside the element. The drag only commits (updates `rotation`) once movement exceeds a 5px threshold. Taps don't accidentally rotate the ring.

**Momentum loop** — on pointer release, if the release velocity is above a minimum threshold and `carryMomentum` is enabled, a `requestAnimationFrame` loop starts. Every frame: `velocity *= 0.95`. Loop exits when `|velocity| < 0.05°/frame`. If `snap` is also on, a snap fires at the end of coasting.

**Snap** — finds the item with the smallest angular distance to the emphasis angle, then animates `rotation` to close that gap over 300ms ease-out.

### Internal Constants

| Constant | Value | What it controls |
|----------|-------|------------------|
| `DRAG_THRESHOLD` | `5` px | Minimum movement before a drag commits |
| `MOMENTUM_DECAY` | `0.95` | Speed multiplier applied each frame during coast |
| `MIN_VELOCITY` | `0.05` °/frame | Below this, momentum loop stops |
| `SNAP_DURATION` | `300` ms | Duration of snap settle animation |
| `INTRO_SPIN_DEG` | `720` | Degrees to spin on intro |
