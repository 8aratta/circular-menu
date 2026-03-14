const STYLES = `
/* ─── Menu item: visual defaults ─── */
.circular-menu-item {
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    color: #fff;
    font-size: 0.9rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    white-space: nowrap;
    padding: 0.55rem 1.2rem;
    border-radius: 50px;
    isolation: isolate;
    transform-origin: center center;
}

[data-theme="light"] .circular-menu-item {
    color: #000;
}

/* Hover: nudge scale +8% — !important beats inline transform specificity */
.circular-menu-item--open:hover {
    transform: translate(calc(var(--tx) - 50%), calc(var(--ty) - 50%))
               scale(calc(var(--scale-factor, 1) * 1.08)) !important;
    transition:
        transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1),
        opacity   0.15s ease !important;
    transition-delay: 0ms !important;
}

/* ─── Toggle button sizing ─── */
[data-circular-menu-toggle] {
    width: 44px;
    height: 44px;
    flex-shrink: 0;
}

[data-circular-menu-toggle] > div {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
}

/* Icon spans: fill wrapper, non-interactive */
[data-circular-menu-icon] {
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    user-select: none;
    pointer-events: none;
}

/* ─── Overlay: block touch scroll in carousel mode ─── */
[data-circular-menu-overlay][data-carousel] {
    touch-action: none;
}

[data-circular-menu-overlay]:active {
    cursor: grabbing;
}

/* ─── Idle hint keyframe ─── */
@keyframes circular-menu-idle-twitch {
    0%,  75% { rotate:   0deg; scale: 1;    }
    79%      { rotate: -14deg; scale: 1.07; }
    84%      { rotate:   9deg; scale: 0.96; }
    88%      { rotate:  -5deg; scale: 1.03; }
    91%      { rotate:   2deg; scale: 0.99; }
    94%, 100% { rotate:  0deg; scale: 1;    }
}

/* ─── Mobile ─── */
@media (max-width: 768px) {
    .circular-menu-item {
        font-size: 0.82rem;
        padding: 0.5rem 1rem;
    }
    [data-circular-menu-toggle] {
        width: 40px;
        height: 40px;
    }
    [data-circular-menu-toggle] > div {
        width: 28px;
        height: 28px;
    }
}

@media (max-width: 480px) {
    .circular-menu-item {
        font-size: 0.75rem;
        padding: 0.45rem 0.9rem;
    }
}
`;

let injected = false;

export function injectStructuralStyles(): void {
    if (injected || typeof document === 'undefined') return;
    injected = true;
    const style = document.createElement('style');
    style.setAttribute('data-circular-menu-styles', '');
    style.textContent = STYLES;
    document.head.appendChild(style);
}
