import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toRad } from '../utils/mathUtils';

export interface UseCarouselInteractionResult {
    rotationOffset: number;
    isInteracting: boolean;
    isSnapping: boolean;
    isIdle: boolean;
    handlePointerDown: (e: React.PointerEvent<HTMLElement>) => void;
    handlePointerMove: (e: React.PointerEvent<HTMLElement>) => void;
    handlePointerUp: (e: React.PointerEvent<HTMLElement>) => void;
    handleWheel: (e: React.WheelEvent<HTMLElement>) => void;
    resetRotation: () => void;
}

interface Options {
    carousel: boolean;
    isOpen: boolean;
    snap: boolean;
    /** Apply drag-speed inertia on release — fortune-wheel spin-down */
    carryMomentum: boolean;
    /**
     * When true, the carousel does a single flourish spin when the menu opens
     * (uses the same momentum physics as carryMomentum).
     */
    introSpin: boolean;
    emphasisTargetAngle: number | null;
    rawPositionsRef: React.MutableRefObject<number[]>;
    menuRef: React.RefObject<HTMLDivElement | null>;
    hasDraggedRef: React.MutableRefObject<boolean>;
}

/** Friction coefficient per ms — fast flick coasts ~1-2 s */
const FRICTION_PER_MS = 0.003;
/** Stop inertia loop when velocity drops below this (deg/ms) */
const MIN_VELOCITY = 0.01;
/** Velocity sample window (ms) */
const VELOCITY_WINDOW_MS = 80;
/** Cap to prevent unrealistic flicks */
const MAX_VELOCITY = 3.0;
/** Initial speed for the open flourish (deg/ms) — ~400° total travel */
const INTRO_SPIN_VELOCITY = 1.2;
/** Delay after open before the intro spin fires, letting items fan out first */
const INTRO_SPIN_DELAY_MS = 250;
/** How long of inactivity before showing the idle hint (ms) */
const IDLE_DELAY_MS = 4000;

interface VelocitySample {
    t: number;
    dAngle: number;
}

export function useCarouselInteraction({
    carousel,
    isOpen,
    snap,
    carryMomentum,
    introSpin,
    emphasisTargetAngle,
    rawPositionsRef,
    menuRef,
    hasDraggedRef,
}: Options): UseCarouselInteractionResult {
    const [rotationOffset, setRotationOffset] = useState(0);
    const [isInteracting, setIsInteracting] = useState(false);
    const [isSnapping, setIsSnapping] = useState(false);
    const [isIdle, setIsIdle] = useState(false);

    const draggingRef = useRef(false);
    const dragStartAngleRef = useRef(0);
    const previousRotationRef = useRef(0);
    const startPointRef = useRef({ x: 0, y: 0 });
    const interactingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const snapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const scrollDirectionIntentRef = useRef(0);

    // Momentum / inertia tracking
    const velocitySamplesRef = useRef<VelocitySample[]>([]);
    const rafIdRef = useRef<number | null>(null);
    const prevAngleRef = useRef(0);

    // Keep a stable ref to emphasisTargetAngle to avoid stale-closure issues
    const emphasisTargetAngleRef = useRef(emphasisTargetAngle);
    emphasisTargetAngleRef.current = emphasisTargetAngle;

    // ── Snap logic ──────────────────────────────────────────────────────────

    const executeSnap = useCallback((baseAngles: number[]) => {
        if (!snap || emphasisTargetAngle === null || baseAngles.length === 0) return;

        let momentumBias = 0;
        if (scrollDirectionIntentRef.current > 10) momentumBias = 1;
        else if (scrollDirectionIntentRef.current < -10) momentumBias = -1;
        scrollDirectionIntentRef.current = 0;

        setRotationOffset(prevOffset => {
            let bestDiff = Infinity;
            let diffToApply = 0;
            const normTarget = ((emphasisTargetAngle % 360) + 360) % 360;

            baseAngles.forEach(angle => {
                const currentTotal = angle + prevOffset;
                const rad = toRad(currentTotal);
                const distortedRad = Math.atan2(Math.sin(rad), Math.cos(rad) * 1.35);
                const distortedDeg = (distortedRad * 180) / Math.PI;
                const normCurrent = ((distortedDeg % 360) + 360) % 360;

                let diff = normTarget - normCurrent;
                if (diff > 180) diff -= 360;
                else if (diff < -180) diff += 360;

                let biasPenalty = 0;
                if (momentumBias > 0 && diff > 1) biasPenalty = 1000;
                else if (momentumBias < 0 && diff < -1) biasPenalty = 1000;

                if (Math.abs(diff) + biasPenalty < bestDiff) {
                    bestDiff = Math.abs(diff) + biasPenalty;
                    diffToApply = diff;
                }
            });

            if (bestDiff > 0.1) {
                setIsInteracting(false);
                if (interactingTimeoutRef.current) clearTimeout(interactingTimeoutRef.current);
                setIsSnapping(true);
                if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
                snapTimeoutRef.current = setTimeout(() => setIsSnapping(false), 400);
                return prevOffset + diffToApply;
            }
            return prevOffset;
        });
    }, [snap, emphasisTargetAngle]);

    // ── Wheel interaction heartbeat ─────────────────────────────────────────

    const markInteracting = useCallback((baseAngles?: number[]) => {
        setIsInteracting(true);
        setIsSnapping(false);
        if (interactingTimeoutRef.current) clearTimeout(interactingTimeoutRef.current);
        interactingTimeoutRef.current = setTimeout(() => {
            setIsInteracting(false);
            if (baseAngles) executeSnap(baseAngles);
        }, 150);
    }, [executeSnap]);

    // ── Idle hint scheduling ─────────────────────────────────────────────────

    /** Stable reference; avoids including emphasisTargetAngle in scheduleIdleHint deps */
    const scheduleIdleHint = useCallback(() => {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        if (emphasisTargetAngleRef.current !== null) {
            idleTimerRef.current = setTimeout(() => setIsIdle(true), IDLE_DELAY_MS);
        }
    }, []); // intentionally stable

    const cancelIdleHint = useCallback(() => {
        setIsIdle(false);
        scheduleIdleHint(); // restart the countdown after each interaction
    }, [scheduleIdleHint]);

    // Start / stop idle tracking based on open state
    useEffect(() => {
        if (isOpen) {
            scheduleIdleHint();
        } else {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            setIsIdle(false);
        }
        return () => {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        };
    }, [isOpen, scheduleIdleHint]);

    // ── Momentum / inertia RAF loop ──────────────────────────────────────────

    const startMomentumLoop = useCallback((initialVelocity: number) => {
        if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);

        let velocity = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, initialVelocity));
        let lastTime: number | null = null;

        setIsInteracting(true);
        setIsSnapping(false);

        function tick(now: number) {
            if (lastTime === null) { lastTime = now; }
            const dt = now - lastTime;
            lastTime = now;

            velocity *= Math.exp(-FRICTION_PER_MS * dt);
            setRotationOffset(prev => prev - velocity * dt);

            if (Math.abs(velocity) > MIN_VELOCITY) {
                rafIdRef.current = requestAnimationFrame(tick);
            } else {
                rafIdRef.current = null;
                setIsInteracting(false);
                executeSnap(rawPositionsRef.current);
            }
        }

        rafIdRef.current = requestAnimationFrame(tick);
    }, [executeSnap, rawPositionsRef]);

    /** Cancel any running momentum loop */
    const cancelMomentum = useCallback(() => {
        if (rafIdRef.current !== null) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
        }
        velocitySamplesRef.current = [];
    }, []);

    // ── Intro spin on open ───────────────────────────────────────────────────

    useEffect(() => {
        if (!isOpen || !introSpin || !carousel) return;

        const timerId = setTimeout(() => {
            startMomentumLoop(INTRO_SPIN_VELOCITY);
        }, INTRO_SPIN_DELAY_MS);

        return () => clearTimeout(timerId);
    }, [isOpen, introSpin, carousel, startMomentumLoop]);

    // ── Pointer handlers ─────────────────────────────────────────────────────

    const handlePointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
        if (!carousel || !isOpen) return;
        cancelMomentum();
        cancelIdleHint();
        setIsInteracting(true);
        setIsSnapping(false);
        scrollDirectionIntentRef.current = 0;
        draggingRef.current = true;
        hasDraggedRef.current = false;
        startPointRef.current = { x: e.clientX, y: e.clientY };
        velocitySamplesRef.current = [];

        const rect = menuRef.current?.getBoundingClientRect();
        if (!rect) return;
        const angle = Math.atan2(e.clientY - rect.top, e.clientX - rect.left);
        dragStartAngleRef.current = angle;
        prevAngleRef.current = angle;
        previousRotationRef.current = rotationOffset;

        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }, [carousel, isOpen, rotationOffset, cancelMomentum, cancelIdleHint, menuRef, hasDraggedRef]);

    const handlePointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
        if (!draggingRef.current) return;

        if (
            Math.abs(e.clientX - startPointRef.current.x) > 5 ||
            Math.abs(e.clientY - startPointRef.current.y) > 5
        ) {
            hasDraggedRef.current = true;
        }

        const rect = menuRef.current?.getBoundingClientRect();
        if (!rect) return;
        const angle = Math.atan2(e.clientY - rect.top, e.clientX - rect.left);

        let delta = angle - dragStartAngleRef.current;
        if (delta > Math.PI) delta -= Math.PI * 2;
        if (delta < -Math.PI) delta += Math.PI * 2;
        const deltaDeg = (delta * 180) / Math.PI;
        setRotationOffset(previousRotationRef.current - deltaDeg);

        if (carryMomentum) {
            let frameAngle = angle - prevAngleRef.current;
            if (frameAngle > Math.PI) frameAngle -= Math.PI * 2;
            if (frameAngle < -Math.PI) frameAngle += Math.PI * 2;
            const frameAngleDeg = (frameAngle * 180) / Math.PI;
            const now = performance.now();

            velocitySamplesRef.current.push({ t: now, dAngle: frameAngleDeg });
            const cutoff = now - VELOCITY_WINDOW_MS;
            velocitySamplesRef.current = velocitySamplesRef.current.filter(s => s.t >= cutoff);
        }
        prevAngleRef.current = angle;
    }, [carryMomentum, menuRef, hasDraggedRef]);

    const handlePointerUp = useCallback((e: React.PointerEvent<HTMLElement>) => {
        if (!draggingRef.current) return;
        draggingRef.current = false;
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        cancelIdleHint();

        if (carryMomentum && velocitySamplesRef.current.length >= 2) {
            const samples = velocitySamplesRef.current;
            const totalDuration = samples[samples.length - 1].t - samples[0].t;
            const totalAngle = samples.reduce((sum, s) => sum + s.dAngle, 0);
            const velocityDegPerMs = totalDuration > 0 ? totalAngle / totalDuration : 0;

            if (Math.abs(velocityDegPerMs) > MIN_VELOCITY) {
                startMomentumLoop(velocityDegPerMs);
            } else {
                setIsInteracting(false);
                executeSnap(rawPositionsRef.current);
            }
        } else {
            setIsInteracting(false);
            executeSnap(rawPositionsRef.current);
        }

        velocitySamplesRef.current = [];
    }, [carryMomentum, cancelIdleHint, startMomentumLoop, executeSnap, rawPositionsRef]);

    // ── Wheel handler ────────────────────────────────────────────────────────

    const handleWheel = useCallback((e: React.WheelEvent<HTMLElement>) => {
        if (!carousel || !isOpen) return;
        cancelMomentum();
        cancelIdleHint();
        scrollDirectionIntentRef.current += e.deltaY;
        markInteracting(rawPositionsRef.current);
        const deltaDeg = e.deltaY * 0.2;
        setRotationOffset(prev => prev - deltaDeg);
    }, [carousel, isOpen, cancelMomentum, cancelIdleHint, markInteracting, rawPositionsRef]);

    // ── External reset ───────────────────────────────────────────────────────

    const resetRotation = useCallback(() => {
        cancelMomentum();
        setRotationOffset(0);
        setIsInteracting(false);
        setIsSnapping(false);
        setIsIdle(false);
        hasDraggedRef.current = false;
    }, [cancelMomentum, hasDraggedRef]);

    return {
        rotationOffset,
        isInteracting,
        isSnapping,
        isIdle,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        handleWheel,
        resetRotation,
    };
}
