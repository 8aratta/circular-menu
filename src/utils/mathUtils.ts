import { PositionEntry } from "../types";


/** Convert degrees to radians */
export const toRad = (deg: number): number => (deg * Math.PI) / 180;

/**
 * Compute (x, y) for a point on a circle.
 * Uses standard math angles but flips Y for CSS (positive Y = down).
 */
export function getRadialPosition(angleDeg: number, radius: number): { x: number; y: number } {
    const rad = toRad(angleDeg);
    return {
        x: Math.round(radius * Math.cos(rad)),
        y: Math.round(radius * -Math.sin(rad)),
    };
}

/**
 * Resolve the effective start and end angles from the shorthand `angle` prop
 * or explicit `startAngle` / `endAngle` overrides.
 */
export function resolveAngleRange(
    angle: number | 'top' | 'right' | 'bottom' | 'left' | undefined,
    startAngle: number | undefined,
    endAngle: number | undefined
): { calcStart: number; calcEnd: number } {
    let center = 225; // default bottom-left
    if (typeof angle === 'number') center = angle;
    else if (angle === 'top') center = 90;
    else if (angle === 'left') center = 180;
    else if (angle === 'bottom') center = 270;
    else if (angle === 'right') center = 0;

    return {
        calcStart: startAngle !== undefined ? startAngle : center - 45,
        calcEnd: endAngle !== undefined ? endAngle : center + 45,
    };
}

/**
 * Resolve the emphasis target angle from the `emphasize` prop.
 * Returns null if emphasis is disabled.
 */
export function resolveEmphasisAngle(
    emphasize: boolean | number | 'top' | 'right' | 'bottom' | 'left',
    calcStart: number,
    calcEnd: number
): number | null {
    if (emphasize === false) return null;
    if (typeof emphasize === 'number') return emphasize;
    if (emphasize === 'top') return 90;
    if (emphasize === 'left') return 180;
    if (emphasize === 'bottom') return 270;
    if (emphasize === 'right') return 0;
    return (calcStart + calcEnd) / 2; // true → arc midpoint
}

/**
 * Apply the elliptical aspect-ratio warp to a mathematical angle.
 * Stretches top/bottom gaps and compresses left/right for rectangular pills.
 */
export function warpAngle(mathematicalAngle: number, aspectRatio: number): number {
    const rad = toRad(mathematicalAngle);
    const distortedRad = Math.atan2(Math.sin(rad), Math.cos(rad) * aspectRatio);
    return (distortedRad * 180) / Math.PI;
}

/**
 * Compute the visual scale factor for a menu item based on its angular distance
 * from the emphasis target.
 */
export function computeItemScale(
    finalAngle: number,
    emphasisTargetAngle: number | null,
    emphasisScale: number | undefined,
    neutralScale: number | undefined
): number {
    if (emphasisTargetAngle === null || emphasisScale === undefined) return 1;

    const normCurrent = ((finalAngle % 360) + 360) % 360;
    const normTarget = ((emphasisTargetAngle % 360) + 360) % 360;
    let diff = Math.abs(normCurrent - normTarget);
    if (diff > 180) diff = 360 - diff;

    if (typeof neutralScale === 'number') {
        // Continuous mode: interpolate all items from emphasisScale → neutralScale
        const normalizedDist = diff / 180;
        const smoothFactor = (Math.cos(normalizedDist * Math.PI) + 1) / 2;
        return neutralScale + (emphasisScale - neutralScale) * smoothFactor;
    }

    // Bump mode: only boost items within ±45°
    if (diff < 45) {
        const boost = Math.cos((diff / 45) * (Math.PI / 2)) * (emphasisScale - 1);
        return 1 + boost;
    }
    return 1;
}

/**
 * Compute the raw base angles for each link, before rotation offset is applied.
 */
export function computeBaseAngles(
    count: number,
    calcStart: number,
    calcEnd: number,
    carousel: boolean
): number[] {
    const actualEndAngle = carousel ? calcStart + 360 : calcEnd;
    const actualCount = carousel ? count : Math.max(1, count - 1);

    return Array.from({ length: count }, (_, i) =>
        count === 1
            ? (calcStart + actualEndAngle) / 2
            : calcStart + (i * (actualEndAngle - calcStart)) / actualCount
    );
}

/**
 * Apply rotation offset and elliptical warp to produce final (x, y) positions.
 */
export function computeRotatedPositions(
    baseAngles: number[],
    rotationOffset: number,
    radius: number,
    aspectRatio: number
): PositionEntry[] {
    return baseAngles.map(raw => {
        const mathematicalAngle = raw + rotationOffset;
        const distortedDeg = warpAngle(mathematicalAngle, aspectRatio);
        const pos = getRadialPosition(distortedDeg, radius);
        return { x: pos.x, y: pos.y, visualAngle: distortedDeg, mathAngle: mathematicalAngle };
    });
}
