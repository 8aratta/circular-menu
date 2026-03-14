# 🔧 Utils

Two files of pure utility functions. No DOM, no side effects — just math and filter-building.

---

## mathUtils

**Source:** `src/utils/mathUtils.ts`

Pure geometry helpers used by `CircularMenu` to compute item positions.

### `toRadians(degrees: number): number`

Converts degrees to radians. `degrees × (π / 180)`. You know this one.

---

### `toDegrees(radians: number): number`

Converts radians to degrees. The other way.

---

### `normaliseAngle(angle: number): number`

Clamps any angle to `[0, 360)`. Useful for normalising accumulated rotation offsets.

---

### `angularDistance(a: number, b: number): number`

Returns the **shortest signed** distance from `a` to `b`, in `(−180, 180]`. Positive = clockwise. Used heavily by the snap algorithm.

---

### `distributeOnArc(count, startAngle, endAngle): number[]`

Returns `count` angles evenly spaced from `startAngle` to `endAngle` inclusive. Used in static arc mode to compute item positions.

---

### `distributeOnCircle(count, offsetAngle?): number[]`

Returns `count` angles evenly spaced around the full 360° circle, starting at `offsetAngle` (defaults to `0`). Used in carousel mode.

---

### `polarToCartesian(angle, radius, cx?, cy?): { x: number; y: number }`

Converts polar `(angle, radius)` to Cartesian `(x, y)`. `cx`, `cy` offset the origin (defaults to `0, 0`).

---

## liquidGlass

**Source:** `src/utils/liquidGlass.ts`

Builds the SVG filter that produces the liquid-glass visual effect on menu pills. This is where the weird magic lives.

### `LiquidGlassOptions`

```ts
interface LiquidGlassOptions {
  turbulenceFrequency?: number;   // default: 0.015
  turbulenceOctaves?: number;     // default: 3
  displacementScale?: number;     // default: 18
  blurStdDeviation?: number;      // default: 1.5
  saturation?: number;            // default: 1.4
  brightness?: number;            // default: 1.05
}
```

---

### `calculateRefractionProfile(options?): RefractionProfile`

Computes the numeric parameters for the displacement map based on `LiquidGlassOptions`. Returns an internal profile object that `generateDisplacementMap` consumes.

---

### `generateDisplacementMap(profile): SVGElement`

Creates an `<feDisplacementMap>` SVG element configured from the refraction profile.

---

### `buildLiquidGlassFilter(options?): SVGSVGElement`

The one you actually call. Assembles a complete hidden `<svg>` with `<filter id="liquidGlass">` containing the full primitive chain:

```
feTurbulence
  → feDisplacementMap   (the actual glass distortion)
  → feGaussianBlur      (frosted softness)
  → feColorMatrix       (saturation boost)
  → feComponentTransfer (brightness)
  → feComposite         (clips to source shape)
```

Returns the `<svg>` element ready to append to `document.body`. Called exactly once by `useLiquidGlass` on the first menu open.
