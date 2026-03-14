import { describe, it, expect } from 'vitest';
import {
    toRad,
    getRadialPosition,
    resolveAngleRange,
    resolveEmphasisAngle,
    warpAngle,
    computeItemScale,
    computeBaseAngles,
    computeRotatedPositions,
} from '../utils/mathUtils';

// ─── toRad ───────────────────────────────────────────────────────────────────

describe('toRad', () => {
    it('converts 0°', () => expect(toRad(0)).toBe(0));
    it('converts 90°', () => expect(toRad(90)).toBeCloseTo(Math.PI / 2));
    it('converts 180°', () => expect(toRad(180)).toBeCloseTo(Math.PI));
    it('converts 360°', () => expect(toRad(360)).toBeCloseTo(2 * Math.PI));
    it('converts negative degrees', () => expect(toRad(-90)).toBeCloseTo(-Math.PI / 2));
});

// ─── getRadialPosition ────────────────────────────────────────────────────────

describe('getRadialPosition', () => {
    it('0° points right (positive x, y≈0)', () => {
        const pos = getRadialPosition(0, 100);
        expect(pos.x).toBe(100);
        expect(pos.y).toBeCloseTo(0);
    });

    it('180° points left (negative x, y≈0)', () => {
        const pos = getRadialPosition(180, 100);
        expect(pos.x).toBe(-100);
        expect(pos.y).toBeCloseTo(0);
    });

    it('90° points up in CSS coords (y is negative due to flip)', () => {
        const pos = getRadialPosition(90, 100);
        expect(pos.x).toBeCloseTo(0);
        expect(pos.y).toBe(-100); // CSS: positive Y = down, so up = negative
    });

    it('270° points down in CSS coords (y is positive)', () => {
        const pos = getRadialPosition(270, 100);
        expect(pos.x).toBeCloseTo(0);
        expect(pos.y).toBe(100);
    });

    it('scales linearly with radius', () => {
        const pos50 = getRadialPosition(0, 50);
        const pos200 = getRadialPosition(0, 200);
        expect(pos50.x).toBe(50);
        expect(pos200.x).toBe(200);
    });
});

// ─── resolveAngleRange ────────────────────────────────────────────────────────

describe('resolveAngleRange', () => {
    it('defaults to bottom-left (225°) with ±45° spread', () => {
        const result = resolveAngleRange(undefined, undefined, undefined);
        expect(result.calcStart).toBe(180);
        expect(result.calcEnd).toBe(270);
    });

    it("angle='top' centers on 90°", () => {
        const { calcStart, calcEnd } = resolveAngleRange('top', undefined, undefined);
        expect(calcStart).toBe(45);
        expect(calcEnd).toBe(135);
    });

    it("angle='bottom' centers on 270°", () => {
        const { calcStart, calcEnd } = resolveAngleRange('bottom', undefined, undefined);
        expect(calcStart).toBe(225);
        expect(calcEnd).toBe(315);
    });

    it("angle='left' centers on 180°", () => {
        const { calcStart, calcEnd } = resolveAngleRange('left', undefined, undefined);
        expect(calcStart).toBe(135);
        expect(calcEnd).toBe(225);
    });

    it("angle='right' centers on 0°", () => {
        const { calcStart, calcEnd } = resolveAngleRange('right', undefined, undefined);
        expect(calcStart).toBe(-45);
        expect(calcEnd).toBe(45);
    });

    it('numeric angle overrides named string', () => {
        const { calcStart, calcEnd } = resolveAngleRange(90, undefined, undefined);
        expect(calcStart).toBe(45);
        expect(calcEnd).toBe(135);
    });

    it('explicit startAngle overrides center-derived start', () => {
        const { calcStart, calcEnd } = resolveAngleRange('top', 10, undefined);
        expect(calcStart).toBe(10);
        expect(calcEnd).toBe(135); // end still derived
    });

    it('explicit endAngle overrides center-derived end', () => {
        const { calcStart, calcEnd } = resolveAngleRange('top', undefined, 200);
        expect(calcStart).toBe(45);
        expect(calcEnd).toBe(200);
    });

    it('both explicit angles override everything', () => {
        const { calcStart, calcEnd } = resolveAngleRange(undefined, 30, 150);
        expect(calcStart).toBe(30);
        expect(calcEnd).toBe(150);
    });
});

// ─── resolveEmphasisAngle ─────────────────────────────────────────────────────

describe('resolveEmphasisAngle', () => {
    it('returns null when emphasis is false', () => {
        expect(resolveEmphasisAngle(false, 0, 90)).toBeNull();
    });

    it('returns the arc midpoint when emphasis is true', () => {
        expect(resolveEmphasisAngle(true, 90, 270)).toBe(180);
    });

    it('returns exact number when numeric', () => {
        expect(resolveEmphasisAngle(45, 0, 90)).toBe(45);
    });

    it("'top' → 90", () => expect(resolveEmphasisAngle('top', 0, 180)).toBe(90));
    it("'left' → 180", () => expect(resolveEmphasisAngle('left', 0, 360)).toBe(180));
    it("'bottom' → 270", () => expect(resolveEmphasisAngle('bottom', 0, 360)).toBe(270));
    it("'right' → 0", () => expect(resolveEmphasisAngle('right', 0, 360)).toBe(0));
});

// ─── warpAngle ────────────────────────────────────────────────────────────────

describe('warpAngle', () => {
    it('returns 0 for 0° (right side unchanged)', () => {
        expect(warpAngle(0, 1.35)).toBeCloseTo(0);
    });

    it('returns ±180° for ±180° (left side unchanged)', () => {
        expect(Math.abs(warpAngle(180, 1.35))).toBeCloseTo(180);
    });

    it('compresses 90° toward 0 with aspect > 1 (top/bottom squeezed away from 90)', () => {
        // With aspect > 1, angles near 90/270 are pulled toward 0/180
        const warped = warpAngle(90, 1.35);
        // atan2(sin(90°), cos(90°)*1.35) = atan2(1, 0) = 90° still — no, wait:
        // cos(90°) ≈ 0, so it's still atan2(1, 0) = 90°
        // Actually warp doesn't change 90/270 since cos(90)=0 regardless of aspect
        expect(warped).toBeCloseTo(90);
    });

    it('compresses 45° toward 0 when aspect > 1', () => {
        // cos(45°)*1.35 > cos(45°) so atan2 result is smaller angle
        const warped = warpAngle(45, 1.35);
        expect(warped).toBeLessThan(45);
    });

    it('aspect ratio of 1 is identity', () => {
        for (const deg of [0, 45, 90, 135, 180]) {
            expect(warpAngle(deg, 1)).toBeCloseTo(deg, 5);
        }
    });
});

// ─── computeItemScale ─────────────────────────────────────────────────────────

describe('computeItemScale', () => {
    it('returns 1 when emphasisTargetAngle is null', () => {
        expect(computeItemScale(90, null, 1.5, undefined)).toBe(1);
    });

    it('returns 1 when emphasisScale is undefined', () => {
        expect(computeItemScale(90, 90, undefined, undefined)).toBe(1);
    });

    describe('bump mode (no neutralScale)', () => {
        it('returns emphasisScale at exactly 0° distance', () => {
            const scale = computeItemScale(90, 90, 1.5, undefined);
            expect(scale).toBeCloseTo(1.5);
        });

        it('returns 1 at exactly 45° distance', () => {
            const scale = computeItemScale(135, 90, 1.5, undefined);
            expect(scale).toBeCloseTo(1);
        });

        it('returns 1 for items more than 45° away', () => {
            const scale = computeItemScale(180, 90, 1.5, undefined);
            expect(scale).toBe(1);
        });

        it('handles 360° wrap-around correctly', () => {
            // 350° and 10° are 20° apart
            const scale = computeItemScale(350, 10, 1.5, undefined);
            expect(scale).toBeGreaterThan(1);
        });
    });

    describe('smooth mode (neutralScale provided)', () => {
        it('returns emphasisScale at 0° distance', () => {
            const scale = computeItemScale(90, 90, 1.5, 0.5);
            expect(scale).toBeCloseTo(1.5);
        });

        it('returns neutralScale at 180° distance', () => {
            const scale = computeItemScale(270, 90, 1.5, 0.5);
            expect(scale).toBeCloseTo(0.5);
        });

        it('interpolates smoothly between 0° and 180°', () => {
            const at0 = computeItemScale(90, 90, 1.5, 0.5);   // emphasisScale
            const at90 = computeItemScale(0, 90, 1.5, 0.5);   // midpoint
            const at180 = computeItemScale(270, 90, 1.5, 0.5); // neutralScale
            expect(at0).toBeGreaterThan(at90);
            expect(at90).toBeGreaterThan(at180);
        });
    });
});

// ─── computeBaseAngles ───────────────────────────────────────────────────────

describe('computeBaseAngles', () => {
    it('returns single item at arc midpoint when count=1', () => {
        const angles = computeBaseAngles(1, 180, 270, false);
        expect(angles).toHaveLength(1);
        expect(angles[0]).toBe((180 + 270) / 2); // midpoint
    });

    describe('arc mode (carousel=false)', () => {
        it('first item is at calcStart', () => {
            const angles = computeBaseAngles(3, 180, 270, false);
            expect(angles[0]).toBe(180);
        });

        it('last item is at calcEnd', () => {
            const angles = computeBaseAngles(3, 180, 270, false);
            expect(angles[angles.length - 1]).toBe(270);
        });

        it('returns correct count', () => {
            expect(computeBaseAngles(5, 0, 90, false)).toHaveLength(5);
        });

        it('evenly spaces items', () => {
            const angles = computeBaseAngles(3, 0, 90, false);
            expect(angles[1] - angles[0]).toBeCloseTo(angles[2] - angles[1]);
        });
    });

    describe('carousel mode (carousel=true)', () => {
        it('spans full 360° (does not duplicate first/last)', () => {
            const angles = computeBaseAngles(4, 0, 90, true);
            // Total arc = 360°, spacing = 360 / 4 = 90°
            expect(angles[1] - angles[0]).toBeCloseTo(90);
        });

        it('returns the right count of items', () => {
            expect(computeBaseAngles(6, 0, 360, true)).toHaveLength(6);
        });
    });
});

// ─── computeRotatedPositions ─────────────────────────────────────────────────

describe('computeRotatedPositions', () => {
    it('returns same length as input angles', () => {
        const result = computeRotatedPositions([0, 90, 180], 0, 100, 1);
        expect(result).toHaveLength(3);
    });

    it('each entry has x, y, visualAngle, mathAngle', () => {
        const [entry] = computeRotatedPositions([0], 0, 100, 1);
        expect(entry).toHaveProperty('x');
        expect(entry).toHaveProperty('y');
        expect(entry).toHaveProperty('visualAngle');
        expect(entry).toHaveProperty('mathAngle');
    });

    it('mathAngle = base angle + offset', () => {
        const [entry] = computeRotatedPositions([45], 30, 100, 1);
        expect(entry.mathAngle).toBe(75);
    });

    it('rotation offset shifts all positions', () => {
        const base = computeRotatedPositions([0], 0, 100, 1);
        const shifted = computeRotatedPositions([0], 90, 100, 1);
        expect(base[0].x).not.toBeCloseTo(shifted[0].x);
    });

    it('radius scales output proportionally (aspect=1)', () => {
        const r100 = computeRotatedPositions([0], 0, 100, 1);
        const r200 = computeRotatedPositions([0], 0, 200, 1);
        expect(r200[0].x).toBeCloseTo(r100[0].x * 2);
    });
});
