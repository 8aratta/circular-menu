import type * as React from 'react';

export interface NavLink {
    to: string;
    label: string;
}

/**
 * Props passed to the `renderLink` function.
 * Spread these onto your `<Link>` or `<a>` element.
 */
export interface LinkRenderProps {
    ref: React.Ref<HTMLAnchorElement>;
    className: string;
    style: React.CSSProperties;
    draggable: false;
    onClick: (e: React.MouseEvent) => void;
    onDragStart: (e: React.DragEvent) => void;
    onPointerDown?: (e: React.PointerEvent<HTMLElement>) => void;
    onPointerMove?: (e: React.PointerEvent<HTMLElement>) => void;
    onPointerUp?: (e: React.PointerEvent<HTMLElement>) => void;
    onPointerCancel?: (e: React.PointerEvent<HTMLElement>) => void;
}

export interface CircularMenuProps {
    links: NavLink[];
    /**
     * Render function for each navigation link.
     * Receives the link data and all necessary props (ref, className, style,
     * event handlers). Works with any router or plain `<a>` tags.
     *
     * @example — react-router-dom
     * ```tsx
     * renderLink={(link, props) => <Link to={link.to} {...props}>{link.label}</Link>}
     * ```
     * @example — plain anchor
     * ```tsx
     * renderLink={(link, props) => <a href={link.to} {...props}>{link.label}</a>}
     * ```
     */
    renderLink: (link: NavLink, linkProps: LinkRenderProps) => React.ReactNode;
    /** Icon shown when the menu is closed (e.g. a hamburger SVG) */
    openIcon: React.ReactNode;
    /** Icon shown when the menu is open (e.g. an X / close SVG) */
    closeIcon: React.ReactNode;
    /** Override the color theme. Defaults to the OS `prefers-color-scheme`. */
    theme?: 'light' | 'dark';
    /** Radius in px for the radial arc (default: 130) */
    radius?: number;
    /** Central focal point angle (e.g. 225 or 'bottom') */
    angle?: number | 'top' | 'right' | 'bottom' | 'left';
    /** Start angle in degrees (overrides `angle` if set) */
    startAngle?: number;
    /** End angle in degrees (overrides `angle` if set) */
    endAngle?: number;
    /** Stagger delay in ms between each item (default: 50) */
    staggerMs?: number;
    /** Whether to enable 360-degree draggable carousel mode (default: false) */
    carousel?: boolean;
    /** Emphasize a specific angle by scaling items up when they reach it */
    emphasize?: boolean | number | 'top' | 'right' | 'bottom' | 'left';
    /** Smooth snap items to emphasis angle when interaction stops */
    snap?: boolean;
    /** Scale factor for the emphasized item (e.g. 1.33) */
    emphasisScale?: number;
    /** Scale factor for items on the opposite side (e.g. 0.33) */
    neutralScale?: number;
    /** Apply angular momentum on drag release */
    carryMomentum?: boolean;
    /** Demo spin when menu first opens */
    introSpin?: boolean;
}

export interface PositionEntry {
    x: number;
    y: number;
    /** The visually warped angle (after elliptical distortion) in degrees */
    visualAngle: number;
    /** The raw mathematical angle (before warp) in degrees */
    mathAngle: number;
}
