import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMenuState } from '../hooks/useMenuState';

describe('useMenuState', () => {
    beforeEach(() => {
        // Ensure clean body state before each test
        document.body.style.overflow = '';
    });

    afterEach(() => {
        document.body.style.overflow = '';
    });

    it('starts closed', () => {
        const { result } = renderHook(() => useMenuState());
        expect(result.current.isOpen).toBe(false);
    });

    it('toggleMenu opens when closed', () => {
        const { result } = renderHook(() => useMenuState());
        act(() => { result.current.toggleMenu(); });
        expect(result.current.isOpen).toBe(true);
    });

    it('toggleMenu closes when open', () => {
        const { result } = renderHook(() => useMenuState());
        act(() => { result.current.toggleMenu(); });
        act(() => { result.current.toggleMenu(); });
        expect(result.current.isOpen).toBe(false);
    });

    it('closeMenu closes the menu', () => {
        const { result } = renderHook(() => useMenuState());
        act(() => { result.current.toggleMenu(); });
        expect(result.current.isOpen).toBe(true);
        act(() => { result.current.closeMenu(); });
        expect(result.current.isOpen).toBe(false);
    });

    it('locks body scroll when menu opens', () => {
        const { result } = renderHook(() => useMenuState());
        act(() => { result.current.toggleMenu(); });
        expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body scroll when menu closes', () => {
        const { result } = renderHook(() => useMenuState());
        act(() => { result.current.toggleMenu(); });
        act(() => { result.current.toggleMenu(); });
        expect(document.body.style.overflow).not.toBe('hidden');
    });

    it('hasDraggedRef starts as false', () => {
        const { result } = renderHook(() => useMenuState());
        expect(result.current.hasDraggedRef.current).toBe(false);
    });

    it('closeMenu is swallowed when hasDraggedRef is true', () => {
        const { result } = renderHook(() => useMenuState());
        // Open first
        act(() => { result.current.toggleMenu(); });
        expect(result.current.isOpen).toBe(true);

        // Simulate a drag scenario
        act(() => { result.current.hasDraggedRef.current = true; });

        // closeMenu should not change isOpen
        act(() => { result.current.closeMenu(); });
        expect(result.current.isOpen).toBe(true);
    });

    it('closeMenu works after hasDraggedRef is reset to false', async () => {
        vi.useFakeTimers();
        const { result } = renderHook(() => useMenuState());
        act(() => { result.current.toggleMenu(); });
        act(() => { result.current.hasDraggedRef.current = true; });
        act(() => { result.current.closeMenu(); }); // swallowed, schedules reset
        // Allow the async reset setTimeout to fire
        await act(async () => { vi.runAllTimers(); });
        expect(result.current.hasDraggedRef.current).toBe(false);
        vi.useRealTimers();
    });
});
