# 🚀 Getting Started

A fancy radial nav menu in your app in under 5 minutes. Let's go.

---

## What You Need

React 17 or later. That's it. No router required, no extra CSS libraries, no magic peer deps.

```bash
npm install @8aratta/circular-menu
```

Then import the stylesheet once — somewhere near the top of your app, like `main.tsx` or `index.tsx`:

```ts
import '@8aratta/circular-menu/dist/style.css';
```

`react-router-dom` is **not** required — the component is router-agnostic. See [usage.md](usage.md) for the full story on that.
---

## Quick Start

### 1. Define your links

```tsx
const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/work', label: 'Work' },
  { to: '/contact', label: 'Contact' },
];
```

### 2. Pick your icons

Any `ReactNode` works \u2014 an icon library, inline SVG, an emoji, whatever you've got. Here's a quick SVG example:

```tsx
const HamburgerIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
```

### 3. Drop it in

```tsx
import { CircularMenu } from '@8aratta/circular-menu';
import { Link } from 'react-router-dom';

export default function Nav() {
  return (
    <nav style={{ position: 'fixed', top: '1.5rem', right: '2rem', zIndex: 200 }}>
      <CircularMenu
        links={links}
        openIcon={<HamburgerIcon />}
        closeIcon={<CloseIcon />}
        renderLink={(link, props) => (
          <Link to={link.to} {...props}>{link.label}</Link>
        )}
      />
    </nav>
  );
}
```

The component renders **inline** \u2014 no fixed position baked in. Wrap it in whatever container you like and position that instead.

---

## No Router? No Problem

Just pass plain `<a>` tags if you're not using a client-side router:

```tsx
<CircularMenu
  links={links}
  openIcon={<HamburgerIcon />}
  closeIcon={<CloseIcon />}
  renderLink={(link, props) => (
    <a href={link.to} {...props}>{link.label}</a>
  )}
/>
```

Works with Next.js `<Link>`, TanStack Router, hash anchors, or literally anything. The `renderLink` prop is how you tell the component what a "link" means in your app.

---

## Close on Navigation

The menu doesn't auto-close on route change out of the box \u2014 that would require bundling a router. To get that behaviour back, mount it with `key={location.pathname}` so React remounts the whole thing on every navigation:

```tsx
import { useLocation, Link } from 'react-router-dom';

function Nav() {
  const location = useLocation();
  return (
    <nav style={{ position: 'fixed', top: '1.5rem', right: '2rem', zIndex: 200 }}>
      <CircularMenu
        key={location.pathname}
        links={links}
        openIcon={<HamburgerIcon />}
        closeIcon={<CloseIcon />}
        renderLink={(link, props) => (
          <Link to={link.to} {...props}>{link.label}</Link>
        )}
      />
    </nav>
  );
}
```

---

## What's Next

- [usage.md](usage.md) \u2014 carousel mode, emphasis, snap, theming, every single prop
- [examples.md](examples.md) \u2014 ready-to-paste snippets for common setups
---

## Quick start

### 1. Define your links

```tsx
const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/work', label: 'Work' },
  { to: '/contact', label: 'Contact' },
];
```

### 2. Create your icons

Any `ReactNode` works — SVG, an icon library, emoji, an image. Example with inline SVG:

```tsx
const HamburgerIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
```

### 3. Render the menu

```tsx
import { CircularMenu } from '@8aratta/circular-menu';
import { Link } from 'react-router-dom';

export default function Nav() {
  return (
    <nav style={{ position: 'fixed', top: '1.5rem', right: '2rem', zIndex: 200 }}>
      <CircularMenu
        links={links}
        openIcon={<HamburgerIcon />}
        closeIcon={<CloseIcon />}
        renderLink={(link, props) => (
          <Link to={link.to} {...props}>{link.label}</Link>
        )}
        angle="bottom"
        radius={130}
      />
    </nav>
  );
}
```

The component renders inline — position it however you like with a parent `<nav>` or any wrapper.

---

## Without a router

Pass plain `<a>` tags if you don't use a client-side router:

```tsx
<CircularMenu
  links={links}
  openIcon={<HamburgerIcon />}
  closeIcon={<CloseIcon />}
  renderLink={(link, props) => (
    <a href={link.to} {...props}>{link.label}</a>
  )}
/>
```

---

## Close on navigation (react-router-dom)

The menu does not auto-close on route change. To restore this behaviour, pass a `key` tied to the current pathname — React remounts the component on each navigation:

```tsx
import { useLocation, Link } from 'react-router-dom';

function Nav() {
  const location = useLocation();
  return (
    <nav style={{ position: 'fixed', top: '1.5rem', right: '2rem', zIndex: 200 }}>
      <CircularMenu
        key={location.pathname}
        links={links}
        openIcon={<HamburgerIcon />}
        closeIcon={<CloseIcon />}
        renderLink={(link, props) => (
          <Link to={link.to} {...props}>{link.label}</Link>
        )}
      />
    </nav>
  );
}
```

---

## Next steps

- [usage.md](usage.md) — all props and theming options
- [examples.md](examples.md) — carousel, momentum, emphasis, and more recipes
