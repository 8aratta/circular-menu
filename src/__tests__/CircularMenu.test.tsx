import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import CircularMenu from '../CircularMenu';
import type { NavLink, LinkRenderProps } from '../types';

const testLinks: NavLink[] = [
    { to: '/home', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
];

function defaultRenderLink(link: NavLink, props: LinkRenderProps) {
    return (
        <a href={link.to} {...props}>
            {link.label}
        </a>
    );
}

function makeProps(overrides: Partial<React.ComponentProps<typeof CircularMenu>> = {}) {
    return {
        links: testLinks,
        renderLink: defaultRenderLink,
        openIcon: <span data-testid="open-icon">☰</span>,
        closeIcon: <span data-testid="close-icon">✕</span>,
        ...overrides,
    };
}

describe('CircularMenu', () => {
    describe('toggle button', () => {
        it('renders a button', () => {
            render(<CircularMenu {...makeProps()} />);
            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('button has aria-expanded="false" when closed', () => {
            render(<CircularMenu {...makeProps()} />);
            expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
        });

        it('button has aria-label="Open menu" when closed', () => {
            render(<CircularMenu {...makeProps()} />);
            expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Open menu');
        });

        it('button has aria-expanded="true" after click', async () => {
            const user = userEvent.setup();
            render(<CircularMenu {...makeProps()} />);
            await user.click(screen.getByRole('button'));
            expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
        });

        it('button has aria-label="Close menu" when open', async () => {
            const user = userEvent.setup();
            render(<CircularMenu {...makeProps()} />);
            await user.click(screen.getByRole('button'));
            expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Close menu');
        });

        it('toggles aria-expanded back to false on second click', async () => {
            const user = userEvent.setup();
            render(<CircularMenu {...makeProps()} />);
            await user.click(screen.getByRole('button'));
            await user.click(screen.getByRole('button'));
            expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
        });
    });

    describe('icons', () => {
        it('open icon is visible when menu is closed', () => {
            render(<CircularMenu {...makeProps()} />);
            const openIconWrapper = document.querySelector('[data-circular-menu-icon="open"]') as HTMLElement;
            expect(openIconWrapper.style.opacity).toBe('1');
        });

        it('close icon is hidden when menu is closed', () => {
            render(<CircularMenu {...makeProps()} />);
            const closeIconWrapper = document.querySelector('[data-circular-menu-icon="close"]') as HTMLElement;
            expect(closeIconWrapper.style.opacity).toBe('0');
        });

        it('open icon fades out when menu opens', async () => {
            const user = userEvent.setup();
            render(<CircularMenu {...makeProps()} />);
            await user.click(screen.getByRole('button'));
            const openIconWrapper = document.querySelector('[data-circular-menu-icon="open"]') as HTMLElement;
            expect(openIconWrapper.style.opacity).toBe('0');
        });

        it('close icon appears when menu opens', async () => {
            const user = userEvent.setup();
            render(<CircularMenu {...makeProps()} />);
            await user.click(screen.getByRole('button'));
            const closeIconWrapper = document.querySelector('[data-circular-menu-icon="close"]') as HTMLElement;
            expect(closeIconWrapper.style.opacity).toBe('1');
        });
    });

    describe('menu items', () => {
        it('renderLink is called for each link', () => {
            const mockRenderLink = vi.fn(defaultRenderLink);
            render(<CircularMenu {...makeProps({ renderLink: mockRenderLink })} />);
            expect(mockRenderLink).toHaveBeenCalledTimes(testLinks.length);
        });

        it('passes NavLink data to renderLink', () => {
            const mockRenderLink = vi.fn(defaultRenderLink);
            render(<CircularMenu {...makeProps({ renderLink: mockRenderLink })} />);
            const calledLinks = mockRenderLink.mock.calls.map(([link]) => link);
            expect(calledLinks).toEqual(expect.arrayContaining(testLinks));
        });

        it('items have data-open="false" when menu is closed', () => {
            render(<CircularMenu {...makeProps()} />);
            const links = screen.getAllByRole('link');
            links.forEach(link => {
                expect(link).toHaveAttribute('data-open', 'false');
            });
        });

        it('items have data-open="true" when menu is open', async () => {
            const user = userEvent.setup();
            render(<CircularMenu {...makeProps()} />);
            await user.click(screen.getByRole('button'));
            const links = screen.getAllByRole('link');
            links.forEach(link => {
                expect(link).toHaveAttribute('data-open', 'true');
            });
        });

        it('renders the correct number of links', () => {
            render(<CircularMenu {...makeProps()} />);
            expect(screen.getAllByRole('link')).toHaveLength(testLinks.length);
        });

        it('link labels are rendered', () => {
            render(<CircularMenu {...makeProps()} />);
            testLinks.forEach(link => {
                expect(screen.getByText(link.label)).toBeInTheDocument();
            });
        });

        it('clicking a link when open triggers closeMenu and closes the menu', async () => {
            const user = userEvent.setup();
            render(<CircularMenu {...makeProps()} />);
            await user.click(screen.getByRole('button')); // open
            // Click the first link — it should close the menu
            await user.click(screen.getAllByRole('link')[0]);
            expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
        });
    });

    describe('theme', () => {
        it('applies data-theme="light" when theme="light"', () => {
            render(<CircularMenu {...makeProps({ theme: 'light' })} />);
            const root = document.querySelector('[data-circular-menu]') as HTMLElement;
            expect(root).toHaveAttribute('data-theme', 'light');
        });

        it('applies data-theme="dark" when theme="dark"', () => {
            render(<CircularMenu {...makeProps({ theme: 'dark' })} />);
            const root = document.querySelector('[data-circular-menu]') as HTMLElement;
            expect(root).toHaveAttribute('data-theme', 'dark');
        });

        it('updates theme when OS color scheme changes', () => {
            // Set up a matchMedia mock that captures change listeners
            const listeners: ((e: { matches: boolean }) => void)[] = [];
            const mockMQ = {
                matches: false,
                media: '(prefers-color-scheme: dark)',
                onchange: null,
                addListener: () => {},
                removeListener: () => {},
                addEventListener: (_: string, cb: (e: any) => void) => { listeners.push(cb); },
                removeEventListener: (_: string, cb: (e: any) => void) => {
                    const idx = listeners.indexOf(cb);
                    if (idx > -1) listeners.splice(idx, 1);
                },
                dispatchEvent: () => false,
            } as MediaQueryList;
            const spy = vi.spyOn(window, 'matchMedia').mockReturnValue(mockMQ);

            render(<CircularMenu {...makeProps()} />);

            // Initially light (mock starts with matches: false)
            const root = document.querySelector('[data-circular-menu]') as HTMLElement;
            expect(root).toHaveAttribute('data-theme', 'light');

            // Fire dark mode change event
            act(() => { listeners.forEach(cb => cb({ matches: true })); });
            expect(root).toHaveAttribute('data-theme', 'dark');

            spy.mockRestore();
        });
    });

    describe('overlay', () => {
        it('has pointer-events: none when menu is closed', () => {
            render(<CircularMenu {...makeProps()} />);
            const overlay = document.querySelector('[data-circular-menu-overlay]') as HTMLElement;
            expect(overlay.style.pointerEvents).toBe('none');
        });

        it('has pointer-events: auto when menu is open', async () => {
            const user = userEvent.setup();
            render(<CircularMenu {...makeProps()} />);
            await user.click(screen.getByRole('button'));
            const overlay = document.querySelector('[data-circular-menu-overlay]') as HTMLElement;
            expect(overlay.style.pointerEvents).toBe('auto');
        });

        it('clicking overlay closes the menu', async () => {
            const user = userEvent.setup();
            render(<CircularMenu {...makeProps()} />);
            await user.click(screen.getByRole('button')); // open
            const overlay = document.querySelector('[data-circular-menu-overlay]') as HTMLElement;
            await user.click(overlay);
            expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
        });

        it('has data-carousel attribute when carousel=true', () => {
            render(<CircularMenu {...makeProps({ carousel: true })} />);
            const overlay = document.querySelector('[data-circular-menu-overlay]') as HTMLElement;
            expect(overlay).toHaveAttribute('data-carousel');
        });

        it('does not have data-carousel attribute when carousel=false', () => {
            render(<CircularMenu {...makeProps({ carousel: false })} />);
            const overlay = document.querySelector('[data-circular-menu-overlay]') as HTMLElement;
            expect(overlay).not.toHaveAttribute('data-carousel');
        });
    });

    describe('empty links', () => {
        it('renders without crashing with empty links array', () => {
            expect(() => render(<CircularMenu {...makeProps({ links: [] })} />)).not.toThrow();
        });

        it('renders without crashing with a single link', () => {
            expect(() =>
                render(<CircularMenu {...makeProps({ links: [{ to: '/only', label: 'Only' }] })} />)
            ).not.toThrow();
        });
    });

    describe('data-open on root', () => {
        it('root element has data-open="false" initially', () => {
            render(<CircularMenu {...makeProps()} />);
            const root = document.querySelector('[data-circular-menu]') as HTMLElement;
            expect(root).toHaveAttribute('data-open', 'false');
        });

        it('root element has data-open="true" when open', async () => {
            const user = userEvent.setup();
            render(<CircularMenu {...makeProps()} />);
            await user.click(screen.getByRole('button'));
            const root = document.querySelector('[data-circular-menu]') as HTMLElement;
            expect(root).toHaveAttribute('data-open', 'true');
        });
    });
});
