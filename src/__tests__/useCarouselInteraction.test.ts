import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRef } from 'react';
import { useCarouselInteraction } from '../hooks/useCarouselInteraction';

// Helper to build the required refs and options
function makeOptions(overrides: Partial<Parameters<typeof useCarouselInteraction>[0]> = {}) {
    const rawPositionsRef = { current: [180, 225, 270] };
    const menuRef = { current: null as HTMLDivElement | null };
    const hasDraggedRef = { current: false };

    return {
        carousel: true,
        isOpen: true,
        snap: false,
        carryMomentum: false,
        introSpin: false,
        emphasisTargetAngle: null,
        rawPositionsRef,
        menuRef,
        hasDraggedRef,
        ...overrides,
    };
}

describe('useCarouselInteraction', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('initialises with rotationOffset=0', () => {
        const { result } = renderHook(() => useCarouselInteraction(makeOptions()));
        expect(result.current.rotationOffset).toBe(0);
    });

    it('initialises with isInteracting=false', () => {
        const { result } = renderHook(() => useCarouselInteraction(makeOptions()));
        expect(result.current.isInteracting).toBe(false);
    });

    it('initialises with isSnapping=false', () => {
        const { result } = renderHook(() => useCarouselInteraction(makeOptions()));
        expect(result.current.isSnapping).toBe(false);
    });

    it('initialises with isIdle=false', () => {
        const { result } = renderHook(() => useCarouselInteraction(makeOptions()));
        expect(result.current.isIdle).toBe(false);
    });

    describe('idle hint', () => {
        it('fires after 4000ms of inactivity when menu is open and emphasisTargetAngle is set', () => {
            const opts = makeOptions({ emphasisTargetAngle: 225 });
            const { result } = renderHook(() => useCarouselInteraction(opts));
            expect(result.current.isIdle).toBe(false);
            act(() => { vi.advanceTimersByTime(4000); });
            expect(result.current.isIdle).toBe(true);
        });

        it('does not fire when emphasisTargetAngle is null', () => {
            const opts = makeOptions({ emphasisTargetAngle: null });
            const { result } = renderHook(() => useCarouselInteraction(opts));
            act(() => { vi.advanceTimersByTime(5000); });
            expect(result.current.isIdle).toBe(false);
        });

        it('does not fire when menu is closed', () => {
            const opts = makeOptions({ isOpen: false, emphasisTargetAngle: 225 });
            const { result } = renderHook(() => useCarouselInteraction(opts));
            act(() => { vi.advanceTimersByTime(5000); });
            expect(result.current.isIdle).toBe(false);
        });

        it('clears idle flag when menu closes', () => {
            const opts = makeOptions({ emphasisTargetAngle: 225 });
            const { result, rerender } = renderHook(
                (props: Parameters<typeof useCarouselInteraction>[0]) => useCarouselInteraction(props),
                { initialProps: opts }
            );
            act(() => { vi.advanceTimersByTime(4000); });
            expect(result.current.isIdle).toBe(true);

            rerender({ ...opts, isOpen: false });
            expect(result.current.isIdle).toBe(false);
        });
    });

    describe('resetRotation', () => {
        it('resets rotationOffset to 0', () => {
            const opts = makeOptions();
            const { result } = renderHook(() => useCarouselInteraction(opts));
            // Wheel event to shift offset
            act(() => {
                result.current.handleWheel({ deltaY: 100 } as React.WheelEvent<HTMLElement>);
            });
            act(() => { result.current.resetRotation(); });
            expect(result.current.rotationOffset).toBe(0);
        });

        it('clears isInteracting and isSnapping and isIdle', () => {
            const { result } = renderHook(() => useCarouselInteraction(makeOptions()));
            act(() => { result.current.resetRotation(); });
            expect(result.current.isInteracting).toBe(false);
            expect(result.current.isSnapping).toBe(false);
            expect(result.current.isIdle).toBe(false);
        });
    });

    describe('handleWheel', () => {
        it('updates rotationOffset proportionally (deltaY * 0.2)', () => {
            const { result } = renderHook(() => useCarouselInteraction(makeOptions()));
            act(() => {
                result.current.handleWheel({ deltaY: 100 } as React.WheelEvent<HTMLElement>);
            });
            // Offset = 0 - (100 * 0.2) = -20
            expect(result.current.rotationOffset).toBeCloseTo(-20);
        });

        it('accumulates multiple wheel events', () => {
            const { result } = renderHook(() => useCarouselInteraction(makeOptions()));
            act(() => {
                result.current.handleWheel({ deltaY: 50 } as React.WheelEvent<HTMLElement>);
            });
            act(() => {
                result.current.handleWheel({ deltaY: 50 } as React.WheelEvent<HTMLElement>);
            });
            expect(result.current.rotationOffset).toBeCloseTo(-20);
        });

        it('does nothing when carousel=false', () => {
            const { result } = renderHook(() => useCarouselInteraction(makeOptions({ carousel: false })));
            act(() => {
                result.current.handleWheel({ deltaY: 200 } as React.WheelEvent<HTMLElement>);
            });
            expect(result.current.rotationOffset).toBe(0);
        });

        it('does nothing when menu is closed', () => {
            const { result } = renderHook(() => useCarouselInteraction(makeOptions({ isOpen: false })));
            act(() => {
                result.current.handleWheel({ deltaY: 200 } as React.WheelEvent<HTMLElement>);
            });
            expect(result.current.rotationOffset).toBe(0);
        });

        it('sets isInteracting to true', () => {
            const { result } = renderHook(() => useCarouselInteraction(makeOptions()));
            act(() => {
                result.current.handleWheel({ deltaY: 50 } as React.WheelEvent<HTMLElement>);
            });
            expect(result.current.isInteracting).toBe(true);
        });

        it('clears isInteracting after 150ms timeout', () => {
            const { result } = renderHook(() => useCarouselInteraction(makeOptions()));
            act(() => {
                result.current.handleWheel({ deltaY: 50 } as React.WheelEvent<HTMLElement>);
            });
            act(() => { vi.advanceTimersByTime(150); });
            expect(result.current.isInteracting).toBe(false);
        });
    });

    describe('snap', () => {
        it('activates isSnapping after interaction ends (when snap=true, emphasisTargetAngle set)', () => {
            const opts = makeOptions({ snap: true, emphasisTargetAngle: 225 });
            const { result } = renderHook(() => useCarouselInteraction(opts));
            act(() => {
                result.current.handleWheel({ deltaY: 50 } as React.WheelEvent<HTMLElement>);
            });
            // Advance past the 150ms interacting timeout → triggers executeSnap
            act(() => { vi.advanceTimersByTime(150); });
            expect(result.current.isSnapping).toBe(true);
        });

        it('clears isSnapping after 400ms', () => {
            const opts = makeOptions({ snap: true, emphasisTargetAngle: 225 });
            const { result } = renderHook(() => useCarouselInteraction(opts));
            act(() => {
                result.current.handleWheel({ deltaY: 50 } as React.WheelEvent<HTMLElement>);
            });
            // Advance to trigger snap (fires 150ms interacting timeout → executeSnap → isSnapping=true)
            act(() => { vi.advanceTimersByTime(150); });
            expect(result.current.isSnapping).toBe(true);
            // Now advance past the 400ms snap timeout — must be a separate act so React
            // flushes the state update (and the setTimeout inside it) before we advance again
            act(() => { vi.advanceTimersByTime(400); });
            expect(result.current.isSnapping).toBe(false);
        });
    });

    describe('pointer handlers', () => {
        function makePointerEvent(
            overrides: Partial<{ clientX: number; clientY: number; pointerId: number }> = {}
        ): React.PointerEvent<HTMLElement> {
            const target = {
                setPointerCapture: vi.fn(),
                releasePointerCapture: vi.fn(),
            };
            return { clientX: 0, clientY: 0, pointerId: 1, target, ...overrides } as unknown as React.PointerEvent<HTMLElement>;
        }

        it('handlePointerDown sets isInteracting to true', () => {
            const { result } = renderHook(() => useCarouselInteraction(makeOptions()));
            act(() => { result.current.handlePointerDown(makePointerEvent({ clientX: 100, clientY: 100 })); });
            expect(result.current.isInteracting).toBe(true);
        });

        it('handlePointerDown does nothing when isOpen=false', () => {
            const { result } = renderHook(() => useCarouselInteraction(makeOptions({ isOpen: false })));
            act(() => { result.current.handlePointerDown(makePointerEvent()); });
            expect(result.current.isInteracting).toBe(false);
        });

        it('handlePointerDown does nothing when carousel=false', () => {
            const { result } = renderHook(() => useCarouselInteraction(makeOptions({ carousel: false })));
            act(() => { result.current.handlePointerDown(makePointerEvent()); });
            expect(result.current.isInteracting).toBe(false);
        });

        it('handlePointerMove does not throw when called after pointerdown', () => {
            const { result } = renderHook(() => useCarouselInteraction(makeOptions()));
            act(() => { result.current.handlePointerDown(makePointerEvent({ clientX: 100, clientY: 100 })); });
            expect(() =>
                act(() => { result.current.handlePointerMove(makePointerEvent({ clientX: 110, clientY: 100 })); })
            ).not.toThrow();
        });

        it('handlePointerUp sets isInteracting to false after a drag', () => {
            const { result } = renderHook(() => useCarouselInteraction(makeOptions()));
            act(() => { result.current.handlePointerDown(makePointerEvent({ clientX: 100, clientY: 100 })); });
            expect(result.current.isInteracting).toBe(true);
            act(() => { result.current.handlePointerUp(makePointerEvent()); });
            expect(result.current.isInteracting).toBe(false);
        });

        it('handlePointerUp does nothing when not dragging', () => {
            const { result } = renderHook(() => useCarouselInteraction(makeOptions()));
            // No prior handlePointerDown — draggingRef.current is false
            expect(() =>
                act(() => { result.current.handlePointerUp(makePointerEvent()); })
            ).not.toThrow();
            expect(result.current.isInteracting).toBe(false);
        });
    });

    describe('intro spin', () => {
        it('fires startMomentumLoop after 250ms when introSpin=true and carousel=true', () => {
            // Mock RAF to execute tick once so the inner tick function body is covered
            let rafCallCount = 0;
            const rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
                if (rafCallCount === 0) {
                    rafCallCount++;
                    cb(performance.now()); // execute tick; inner call returns 0 immediately
                }
                return 0;
            });
            const opts = makeOptions({ introSpin: true, carousel: true, isOpen: true });
            renderHook(() => useCarouselInteraction(opts));

            // Before delay — should not have fired yet
            act(() => { vi.advanceTimersByTime(249); });
            expect(rafSpy).not.toHaveBeenCalled();

            // After delay — momentum loop is requested and tick executes
            act(() => { vi.advanceTimersByTime(1); });
            expect(rafSpy).toHaveBeenCalled();

            rafSpy.mockRestore();
        });

        it('does not fire intro spin when carousel=false', () => {
            const rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(() => 0);
            const opts = makeOptions({ introSpin: true, carousel: false, isOpen: true });
            renderHook(() => useCarouselInteraction(opts));
            act(() => { vi.advanceTimersByTime(500); });
            expect(rafSpy).not.toHaveBeenCalled();
            rafSpy.mockRestore();
        });

        it('does not fire intro spin when isOpen=false', () => {
            const rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(() => 0);
            const opts = makeOptions({ introSpin: true, carousel: true, isOpen: false });
            renderHook(() => useCarouselInteraction(opts));
            act(() => { vi.advanceTimersByTime(500); });
            expect(rafSpy).not.toHaveBeenCalled();
            rafSpy.mockRestore();
        });
    });
});
