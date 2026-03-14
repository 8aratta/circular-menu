# 🔧 Utils

One file of pure utility functions — just math.

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
