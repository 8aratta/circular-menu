/* ── Liquid Glass: SVG displacement-map generator ── */

const SURFACE_FN = (x: number): number => Math.pow(1 - Math.pow(1 - x, 4), 0.25);

export function calculateRefractionProfile(
    glassThickness: number,
    bezelWidth: number,
    ior: number,
    samples = 128
): Float64Array {
    const eta = 1 / ior;

    function refract(nx: number, ny: number): [number, number] | null {
        const dot = ny;
        const k = 1 - eta * eta * (1 - dot * dot);
        if (k < 0) return null;
        const sq = Math.sqrt(k);
        return [-(eta * dot + sq) * nx, eta - (eta * dot + sq) * ny];
    }

    const profile = new Float64Array(samples);
    for (let i = 0; i < samples; i++) {
        const x = i / samples;
        const y = SURFACE_FN(x);
        const dx = x < 1 ? 0.0001 : -0.0001;
        const y2 = SURFACE_FN(x + dx);
        const deriv = (y2 - y) / dx;
        const mag = Math.sqrt(deriv * deriv + 1);
        const ref = refract(-deriv / mag, -1 / mag);
        if (!ref) { profile[i] = 0; continue; }
        profile[i] = ref[0] * ((y * bezelWidth + glassThickness) / ref[1]);
    }
    return profile;
}

export function generateDisplacementMap(
    w: number,
    h: number,
    radius: number,
    bezelWidth: number,
    profile: Float64Array,
    maxDisp: number
): string {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d')!;
    const img = ctx.createImageData(w, h);
    const d = img.data;

    for (let i = 0; i < d.length; i += 4) {
        d[i] = 128; d[i + 1] = 128; d[i + 2] = 0; d[i + 3] = 255;
    }

    const r = radius, rSq = r * r, r1Sq = (r + 1) ** 2;
    const rBSq = Math.max(r - bezelWidth, 0) ** 2;
    const wB = w - r * 2, hB = h - r * 2, S = profile.length;

    for (let y1 = 0; y1 < h; y1++) {
        for (let x1 = 0; x1 < w; x1++) {
            const x = x1 < r ? x1 - r : x1 >= w - r ? x1 - r - wB : 0;
            const y = y1 < r ? y1 - r : y1 >= h - r ? y1 - r - hB : 0;
            const dSq = x * x + y * y;
            if (dSq > r1Sq || dSq < rBSq) continue;
            const dist = Math.sqrt(dSq);
            const fromSide = r - dist;
            const op = dSq < rSq ? 1 : 1 - (dist - Math.sqrt(rSq)) / (Math.sqrt(r1Sq) - Math.sqrt(rSq));
            if (op <= 0 || dist === 0) continue;
            const cos = x / dist, sin = y / dist;
            const bi = Math.min(((fromSide / bezelWidth) * S) | 0, S - 1);
            const disp = profile[bi] || 0;
            const dX = (-cos * disp) / maxDisp, dY = (-sin * disp) / maxDisp;
            const idx = (y1 * w + x1) * 4;
            d[idx] = (128 + dX * 127 * op + 0.5) | 0;
            d[idx + 1] = (128 + dY * 127 * op + 0.5) | 0;
        }
    }

    ctx.putImageData(img, 0, 0);
    return c.toDataURL();
}

export interface LiquidGlassOptions {
    thickness?: number;
    bezel?: number;
    ior?: number;
    blur?: number;
    radius?: number;
}

export function buildLiquidGlassFilter(
    id: string,
    w: number,
    h: number,
    opts: LiquidGlassOptions = {}
): string {
    const { thickness = 40, bezel = 30, ior = 2.0, blur = 0.4, radius = 50 } = opts;
    const profile = calculateRefractionProfile(thickness, bezel, ior, 128);
    const maxDisp = Math.max(...Array.from(profile).map(Math.abs)) || 1;
    const dispUrl = generateDisplacementMap(w, h, radius, bezel, profile, maxDisp);
    const scale = maxDisp * 1.0;

    return `
    <filter id="${id}" x="0%" y="0%" width="100%" height="100%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="${blur}" result="blurred" />
      <feImage href="${dispUrl}" x="0" y="0" width="${w}" height="${h}" result="disp" />
      <feDisplacementMap in="blurred" in2="disp"
        scale="${scale}" xChannelSelector="R" yChannelSelector="G"
        result="displaced" />
      <feColorMatrix in="displaced" type="saturate" values="4" result="sat" />
      <feBlend in="sat" in2="displaced" mode="normal" />
    </filter>
  `;
}
