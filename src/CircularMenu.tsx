import React, { useMemo, useRef, useState, useEffect } from 'react';
import type { CircularMenuProps } from './types';
import {
    resolveAngleRange,
    resolveEmphasisAngle,
    computeBaseAngles,
    computeRotatedPositions,
    computeItemScale,
} from './utils/mathUtils';
import { useCarouselInteraction } from './hooks/useCarouselInteraction';
import { useLiquidGlass } from './hooks/useLiquidGlass';
import MenuItem from './components/MenuItem';
import baseStyles from './styles/base.module.css';
import buttonStyles from './styles/button.module.css';
import { useMenuState } from './hooks/useMenuState';

/** Aspect ratio used for elliptical angle warping (wider pills → stretch top/bottom) */
const ITEM_ASPECT_RATIO = 1.35;

function CircularMenu({
    links,
    renderLink,
    openIcon,
    closeIcon,
    theme,
    radius = 130,
    angle,
    startAngle,
    endAngle,
    staggerMs = 50,
    carousel = false,
    emphasize = false,
    snap = false,
    emphasisScale,
    neutralScale,
    carryMomentum = false,
    introSpin = false,
}: CircularMenuProps) {
    // ── Theme resolution ──────────────────────────────────────────────────────
    const prefersQuery = useMemo(
        () => (typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null),
        []
    );
    const [osTheme, setOsTheme] = useState<'light' | 'dark'>(
        () => (prefersQuery?.matches ? 'dark' : 'light')
    );
    useEffect(() => {
        if (!prefersQuery) return;
        const handler = (e: MediaQueryListEvent) => setOsTheme(e.matches ? 'dark' : 'light');
        prefersQuery.addEventListener('change', handler);
        return () => prefersQuery.removeEventListener('change', handler);
    }, [prefersQuery]);
    const resolvedTheme = theme ?? osTheme;

    const count = links.length;

    // ── Refs ──────────────────────────────────────────────────────────────────
    const menuRef = useRef<HTMLDivElement>(null);
    const svgDefsRef = useRef<SVGDefsElement>(null);
    const rawPositionsRef = useRef<number[]>([]);

    // ── Angle resolution ─────────────────────────────────────────────────────
    const { calcStart, calcEnd } = useMemo(
        () => resolveAngleRange(angle, startAngle, endAngle),
        [angle, startAngle, endAngle]
    );

    const emphasisTargetAngle = useMemo(
        () => resolveEmphasisAngle(emphasize, calcStart, calcEnd),
        [emphasize, calcStart, calcEnd]
    );

    // ── Custom hooks ─────────────────────────────────────────────────────────
    const { isOpen, toggleMenu, closeMenu, hasDraggedRef } = useMenuState();

    const {
        rotationOffset,
        isInteracting,
        isSnapping,
        isIdle,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        handleWheel,
    } = useCarouselInteraction({
        carousel,
        isOpen,
        snap,
        carryMomentum,
        introSpin,
        emphasisTargetAngle,
        rawPositionsRef,
        menuRef,
        hasDraggedRef,
    });

    useLiquidGlass(isOpen, svgDefsRef);

    // ── Position computation ─────────────────────────────────────────────────
    const baseAngles = useMemo(
        () => computeBaseAngles(count, calcStart, calcEnd, carousel),
        [count, calcStart, calcEnd, carousel]
    );

    rawPositionsRef.current = baseAngles;

    const rotatedPositions = useMemo(
        () => computeRotatedPositions(baseAngles, rotationOffset, radius, ITEM_ASPECT_RATIO),
        [baseAngles, rotationOffset, radius]
    );

    // ── Emphasized item (closest to emphasisTargetAngle) ────────────────────
    const emphasizedIndex = useMemo(() => {
        if (emphasisTargetAngle === null || !isOpen) return -1;
        let minDiff = Infinity;
        let idx = -1;
        rotatedPositions.forEach((pos, i) => {
            const normCurrent = ((pos.visualAngle % 360) + 360) % 360;
            const normTarget = ((emphasisTargetAngle % 360) + 360) % 360;
            let diff = Math.abs(normCurrent - normTarget);
            if (diff > 180) diff = 360 - diff;
            if (diff < minDiff) { minDiff = diff; idx = i; }
        });
        return idx;
    }, [emphasisTargetAngle, rotatedPositions, isOpen]);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className={baseStyles.menuWrapper} data-theme={resolvedTheme}>
            {/* Hidden SVG that holds the displacement filter */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="0"
                height="0"
                style={{ position: 'absolute', overflow: 'hidden' }}
                colorInterpolationFilters="sRGB"
            >
                <defs ref={svgDefsRef} />
            </svg>

            {/* Zero-size anchor at the center of the button */}
            <div className={baseStyles.circularMenu} ref={menuRef}>
                {links.map((link, i) => {
                    const pos = rotatedPositions[i] ?? { x: 0, y: 0, visualAngle: 0 };
                    const scale = computeItemScale(
                        pos.visualAngle,
                        emphasisTargetAngle,
                        emphasisScale,
                        neutralScale
                    );
                    const openDelay = i * staggerMs;
                    const closeDelay = (count - 1 - i) * (staggerMs * 0.8);
                    const isEmphasized = i === emphasizedIndex;
                    const showIdleHint = isEmphasized && isIdle && !isInteracting && !isSnapping;

                    return (
                        <MenuItem
                            key={link.to}
                            link={link}
                            x={pos.x}
                            y={pos.y}
                            scale={scale}
                            isOpen={isOpen}
                            isInteracting={isInteracting}
                            isSnapping={isSnapping}
                            isEmphasized={isEmphasized}
                            showIdleHint={showIdleHint}
                            openDelay={openDelay}
                            closeDelay={closeDelay}
                            renderLink={renderLink}
                            onClick={closeMenu}
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                        />
                    );
                })}
            </div>

            {/* Hamburger / X toggle button */}
            <button
                className={buttonStyles.menuButton}
                onClick={toggleMenu}
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isOpen}
            >
                <div className={buttonStyles.iconWrapper}>
                    <span
                        className={`${buttonStyles.menuIcon} ${isOpen ? buttonStyles.hidden : buttonStyles.visible}`}
                        aria-hidden="true"
                    >
                        {openIcon}
                    </span>
                    <span
                        className={`${buttonStyles.menuIcon} ${isOpen ? buttonStyles.visible : buttonStyles.hidden}`}
                        aria-hidden="true"
                    >
                        {closeIcon}
                    </span>
                </div>
            </button>

            {/* Full-screen overlay — catches outside clicks and carousel drag */}
            <div
                className={[
                    baseStyles.menuOverlay,
                    isOpen ? baseStyles.visible : '',
                    carousel ? baseStyles.carouselOverlay : '',
                ]
                    .filter(Boolean)
                    .join(' ')}
                onClick={closeMenu}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onWheel={handleWheel}
                aria-hidden="true"
            />
        </div>
    );
}

export default CircularMenu;
