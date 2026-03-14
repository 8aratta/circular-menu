import React, { useCallback, useEffect, useRef, useState } from 'react';

export interface UseMenuStateResult {
    isOpen: boolean;
    toggleMenu: () => void;
    closeMenu: (e?: React.MouseEvent | React.FocusEvent) => void;
    hasDraggedRef: React.MutableRefObject<boolean>;
}

/**
 * Manages the open/closed state of the circular menu,
 * the hamburger ↔ X toggle, and scroll locking.
 *
 * Note: Route-change auto-close is not included. To close the menu on
 * navigation, remount the component by passing a `key` tied to the route:
 * `<CircularMenu key={location.pathname} ... />`
 */
export function useMenuState(): UseMenuStateResult {
    const [isOpen, setIsOpen] = useState(false);
    const hasDraggedRef = useRef(false);

    // Lock scroll on every scrollable element while the menu is open
    useEffect(() => {
        if (!isOpen) return;

        const preventScroll = (e: Event) => e.preventDefault();

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        document.addEventListener('wheel', preventScroll, { passive: false, capture: true });
        document.addEventListener('touchmove', preventScroll, { passive: false, capture: true });

        return () => {
            document.body.style.overflow = prevOverflow;
            document.removeEventListener('wheel', preventScroll, { capture: true });
            document.removeEventListener('touchmove', preventScroll, { capture: true });
        };
    }, [isOpen]);

    const toggleMenu = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    const closeMenu = useCallback((_e?: React.MouseEvent | React.FocusEvent) => {
        if (hasDraggedRef.current) {
            // Swallow the click that ends a drag — reset the flag async so the
            // pointer-up handler fires first.
            setTimeout(() => { hasDraggedRef.current = false; }, 0);
            return;
        }
        setIsOpen(false);
    }, []);

    return { isOpen, toggleMenu, closeMenu, hasDraggedRef };
}
