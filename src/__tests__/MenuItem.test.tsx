import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import MenuItem from '../components/MenuItem';
import type { NavLink, LinkRenderProps } from '../types';

const testLink: NavLink = { to: '/home', label: 'Home' };

function makeProps(overrides: Partial<Parameters<typeof MenuItem>[0]> = {}) {
    return {
        link: testLink,
        x: 50,
        y: -80,
        scale: 1,
        isOpen: false,
        isInteracting: false,
        isSnapping: false,
        isEmphasized: false,
        showIdleHint: false,
        openDelay: 0,
        closeDelay: 0,
        renderLink: (_link: NavLink, props: LinkRenderProps) => (
            <a href={_link.to} {...props}>
                {_link.label}
            </a>
        ),
        onClick: vi.fn(),
        ...overrides,
    };
}

describe('MenuItem', () => {
    it('renders the link label', () => {
        render(<MenuItem {...makeProps()} />);
        expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('base class is always present', () => {
        render(<MenuItem {...makeProps()} />);
        expect(screen.getByText('Home')).toHaveClass('circular-menu-item');
    });

    it('adds --open class when isOpen=true', () => {
        render(<MenuItem {...makeProps({ isOpen: true })} />);
        expect(screen.getByText('Home')).toHaveClass('circular-menu-item--open');
    });

    it('does not add --open class when isOpen=false', () => {
        render(<MenuItem {...makeProps({ isOpen: false })} />);
        expect(screen.getByText('Home')).not.toHaveClass('circular-menu-item--open');
    });

    it('adds --interacting class when isInteracting=true', () => {
        render(<MenuItem {...makeProps({ isInteracting: true })} />);
        expect(screen.getByText('Home')).toHaveClass('circular-menu-item--interacting');
    });

    it('adds --snapping class when isSnapping=true', () => {
        render(<MenuItem {...makeProps({ isSnapping: true })} />);
        expect(screen.getByText('Home')).toHaveClass('circular-menu-item--snapping');
    });

    it('adds --emphasized class when isEmphasized=true', () => {
        render(<MenuItem {...makeProps({ isEmphasized: true })} />);
        expect(screen.getByText('Home')).toHaveClass('circular-menu-item--emphasized');
    });

    it('adds --idle-hint class when showIdleHint=true', () => {
        render(<MenuItem {...makeProps({ showIdleHint: true })} />);
        expect(screen.getByText('Home')).toHaveClass('circular-menu-item--idle-hint');
    });

    it('sets data-open="true" when isOpen', () => {
        render(<MenuItem {...makeProps({ isOpen: true })} />);
        expect(screen.getByText('Home')).toHaveAttribute('data-open', 'true');
    });

    it('sets data-open="false" when closed', () => {
        render(<MenuItem {...makeProps({ isOpen: false })} />);
        expect(screen.getByText('Home')).toHaveAttribute('data-open', 'false');
    });

    it('sets data-emphasized when isEmphasized=true', () => {
        render(<MenuItem {...makeProps({ isEmphasized: true })} />);
        expect(screen.getByText('Home')).toHaveAttribute('data-emphasized', 'true');
    });

    it('passes translate transform with x/y in style', () => {
        render(<MenuItem {...makeProps({ x: 50, y: -80 })} />);
        const el = screen.getByText('Home');
        expect(el.style.transform).toContain('50px');
        expect(el.style.transform).toContain('-80px');
    });

    it('includes scale in transform style', () => {
        render(<MenuItem {...makeProps({ scale: 1.5 })} />);
        const el = screen.getByText('Home');
        expect(el.style.transform).toContain('scale(1.5)');
    });

    it('has pointer-events: none when closed', () => {
        render(<MenuItem {...makeProps({ isOpen: false })} />);
        expect(screen.getByText('Home').style.pointerEvents).toBe('none');
    });

    it('has pointer-events: auto when open', () => {
        render(<MenuItem {...makeProps({ isOpen: true })} />);
        expect(screen.getByText('Home').style.pointerEvents).toBe('auto');
    });

    it('transition is "none" when isInteracting=true', () => {
        render(<MenuItem {...makeProps({ isInteracting: true })} />);
        expect(screen.getByText('Home').style.transition).toBe('none');
    });

    it('openDelay is applied as transition-delay when open and not interacting', () => {
        render(<MenuItem {...makeProps({ isOpen: true, openDelay: 200 })} />);
        expect(screen.getByText('Home').style.transitionDelay).toBe('200ms');
    });

    it('animation is set when showIdleHint=true', () => {
        render(<MenuItem {...makeProps({ showIdleHint: true })} />);
        const style = screen.getByText('Home').style;
        expect(style.animation).toContain('circular-menu-idle-twitch');
    });

    it('prevents text selection (selectstart) on the link element', () => {
        render(<MenuItem {...makeProps()} />);
        const link = screen.getByText('Home');
        const event = new Event('selectstart', { cancelable: true, bubbles: true });
        link.dispatchEvent(event);
        expect(event.defaultPrevented).toBe(true);
    });

    it('calls renderLink with the NavLink and props', () => {
        const mockRenderLink = vi.fn((_link: NavLink, props: LinkRenderProps) => (
            <a href={_link.to} {...props}>
                {_link.label}
            </a>
        ));
        render(<MenuItem {...makeProps({ renderLink: mockRenderLink })} />);
        expect(mockRenderLink).toHaveBeenCalledOnce();
        expect(mockRenderLink.mock.calls[0][0]).toEqual(testLink);
    });
});
