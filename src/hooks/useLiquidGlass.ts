import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { buildLiquidGlassFilter } from '../utils/liquidGlass';

/**
 * Injects the SVG displacement filter into the provided `<defs>` ref
 * the first time the menu opens. Subsequent opens are no-ops.
 */
export function useLiquidGlass(
    isOpen: boolean,
    svgDefsRef: RefObject<SVGDefsElement | null>
): void {
    const filtersBuilt = useRef(false);

    useEffect(() => {
        if (!isOpen || filtersBuilt.current || !svgDefsRef.current) return;
        filtersBuilt.current = true;

        const pillW = 120;
        const pillH = 40;
        const filterHtml = buildLiquidGlassFilter('liquid-glass-pill', pillW, pillH, {
            thickness: 40,
            bezel: 20,
            ior: 2.0,
            blur: 0.3,
            radius: 20,
        });

        svgDefsRef.current.innerHTML = filterHtml;
    }, [isOpen, svgDefsRef]);
}
