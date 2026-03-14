import React, { useEffect, useRef } from 'react';
import type { NavLink, LinkRenderProps } from '../types';

interface MenuItemProps {
    link: NavLink;
    x: number;
    y: number;
    scale: number;
    isOpen: boolean;
    isInteracting: boolean;
    isSnapping: boolean;
    isEmphasized: boolean;
    showIdleHint: boolean;
    openDelay: number;
    closeDelay: number;
    renderLink: (link: NavLink, linkProps: LinkRenderProps) => React.ReactNode;
    onClick: (e: React.MouseEvent) => void;
    onPointerDown?: (e: React.PointerEvent<HTMLElement>) => void;
    onPointerMove?: (e: React.PointerEvent<HTMLElement>) => void;
    onPointerUp?: (e: React.PointerEvent<HTMLElement>) => void;
}

/**
 * A single radial navigation pill rendered via `renderLink`.
 * Accepts pre-computed position, scale, and timing from the parent orchestrator
 * and exposes CSS custom properties for the animation system.
 * When `showIdleHint` is true, the item closest to the emphasis angle
 * plays a subtle jiggle animation to invite the user to spin the carousel.
 */
function MenuItem({
    link,
    x,
    y,
    scale,
    isOpen,
    isInteracting,
    isSnapping,
    isEmphasized,
    showIdleHint,
    openDelay,
    closeDelay,
    renderLink,
    onClick,
    onPointerDown,
    onPointerMove,
    onPointerUp,
}: MenuItemProps) {
    const linkRef = useRef<HTMLAnchorElement>(null);

    const className = [
        'circular-menu-item',
        isOpen ? 'circular-menu-item--open' : '',
        isInteracting ? 'circular-menu-item--interacting' : '',
        isSnapping ? 'circular-menu-item--snapping' : '',
        isEmphasized ? 'circular-menu-item--emphasized' : '',
        showIdleHint ? 'circular-menu-item--idle-hint' : '',
    ]
        .filter(Boolean)
        .join(' ');

    useEffect(() => {
        const el = linkRef.current;
        if (!el) return;
        const prevent = (e: Event) => e.preventDefault();
        el.addEventListener('selectstart', prevent);
        return () => el.removeEventListener('selectstart', prevent);
    }, []);

    const transition = isInteracting
        ? 'none'
        : isSnapping
        ? 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
        : 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease';

    const transitionDelay = isInteracting || isSnapping
        ? '0ms'
        : isOpen
        ? `${openDelay}ms`
        : `${closeDelay}ms`;

    const linkProps: LinkRenderProps = {
        ref: linkRef,
        className,
        style: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%)) scale(${scale})`,
            pointerEvents: isOpen ? 'auto' : 'none',
            opacity: isOpen ? 1 : 0,
            userSelect: 'none',
            touchAction: 'none',
            WebkitTapHighlightColor: 'transparent',
            transition,
            transitionDelay,
            ...(showIdleHint ? { animation: 'circular-menu-idle-twitch 8s ease-in-out 1s infinite' } : {}),
            '--tx': `${x}px`,
            '--ty': `${y}px`,
            '--scale-factor': scale,
            '--open-delay': `${openDelay}ms`,
            '--close-delay': `${closeDelay}ms`,
        } as React.CSSProperties,
        'data-open': isOpen ? 'true' : 'false',
        ...(isInteracting ? { 'data-interacting': 'true' as const } : {}),
        ...(isSnapping ? { 'data-snapping': 'true' as const } : {}),
        ...(isEmphasized ? { 'data-emphasized': 'true' as const } : {}),
        ...(showIdleHint ? { 'data-idle-hint': 'true' as const } : {}),
        draggable: false,
        onClick,
        onDragStart: (e: React.DragEvent) => e.preventDefault(),
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerCancel: onPointerUp,
    };

    return <>{renderLink(link, linkProps)}</>;
}

export default MenuItem;
