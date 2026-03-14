import React, { useEffect, useRef } from 'react';
import type { NavLink, LinkRenderProps } from '../types';
import styles from '../styles/menuItem.module.css';
import animStyles from '../styles/animations.module.css';

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
    showIdleHint,
    openDelay,
    closeDelay,
    renderLink,
    onClick,
    onPointerDown,
    onPointerMove,
    onPointerUp,
}: MenuItemProps) {
    const className = [
        styles.menuItem,
        isOpen ? styles.open : '',
        isInteracting ? styles.interacting : '',
        isSnapping ? styles.snapping : '',
        showIdleHint ? animStyles.idleTwitch : '',
    ]
        .filter(Boolean)
        .join(' ');

    const linkRef = useRef<HTMLAnchorElement>(null);

    useEffect(() => {
        const el = linkRef.current;
        if (!el) return;
        const prevent = (e: Event) => e.preventDefault();
        el.addEventListener('selectstart', prevent);
        return () => el.removeEventListener('selectstart', prevent);
    }, []);

    const linkProps: LinkRenderProps = {
        ref: linkRef,
        className,
        style: {
            '--tx': `${x}px`,
            '--ty': `${y}px`,
            '--scale-factor': scale,
            '--open-delay': `${openDelay}ms`,
            '--close-delay': `${closeDelay}ms`,
        } as React.CSSProperties,
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
