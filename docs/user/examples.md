# 🧪 Examples

Copy-paste snippets for common setups. All examples assume you've imported the stylesheet and have `links`, `HamburgerIcon`, and `CloseIcon` already defined.

---

## The Classic (bottom-left arc, default)

No config needed \u2014 bottom-left is the default. This is what you get with just the required props.

```tsx
<CircularMenu
  links={links}
  openIcon={<HamburgerIcon />}
  closeIcon={<CloseIcon />}
  renderLink={(link, props) => <Link to={link.to} {...props}>{link.label}</Link>}
/>
```

---

## Bottom Arc with a Bigger Spread

Push the items further out and center them at the bottom.

```tsx
<CircularMenu
  links={links}
  openIcon={<HamburgerIcon />}
  closeIcon={<CloseIcon />}
  renderLink={(link, props) => <Link to={link.to} {...props}>{link.label}</Link>}
  angle="bottom"
  radius={175}
/>
```

---

## Manual Arc — Left Semicircle

`startAngle` / `endAngle` give you full control. This fans items across the entire left half:
<CircularMenu
  links={links}
  openIcon={<HamburgerIcon />}
  closeIcon={<CloseIcon />}
  renderLink={(link, props) => <Link to={link.to} {...props}>{link.label}</Link>}
  startAngle={90}
  endAngle={270}
  radius={150}
/>
```

---

## Carousel with Snap

Full 360° ring. Drag or scroll to spin; releases snap the nearest item to the bottom.

```tsx
<CircularMenu
  links={links}
  openIcon={<HamburgerIcon />}
  closeIcon={<CloseIcon />}
  renderLink={(link, props) => <Link to={link.to} {...props}>{link.label}</Link>}
  carousel
  emphasize="bottom"
  snap
  emphasisScale={1.33}
/>
```

---

## Full Carousel — The Whole Package

Snap, momentum, and an intro spin to introduce the carousel on first open.

```tsx
<CircularMenu
  links={links}
  openIcon={<HamburgerIcon />}
  closeIcon={<CloseIcon />}
  renderLink={(link, props) => <Link to={link.to} {...props}>{link.label}</Link>}
  carousel
  emphasize="bottom"
  snap
  carryMomentum
  introSpin
  emphasisScale={1.33}
  neutralScale={0.75}
/>
```

---

## Fish-Eye Scaling

Set both `emphasisScale` and `neutralScale` and you get a continuous size gradient — large at the focus, tiny on the far side, smooth cosine interpolation everywhere in between.

```tsx
<CircularMenu
  links={links}
  openIcon={<HamburgerIcon />}
  closeIcon={<CloseIcon />}
  renderLink={(link, props) => <Link to={link.to} {...props}>{link.label}</Link>}
  carousel
  emphasize={270}
  emphasisScale={1.4}
  neutralScale={0.6}
/>
```

---

## Bump-Only (no neutral scale)

Items within ±45° of the emphasis angle scale up. Everything else stays at 1. Subtler than fish-eye, but still draws the eye.

```tsx
<CircularMenu
  links={links}
  openIcon={<HamburgerIcon />}
  closeIcon={<CloseIcon />}
  renderLink={(link, props) => <Link to={link.to} {...props}>{link.label}</Link>}
  carousel
  emphasize="bottom"
  snap
  emphasisScale={1.33}
/>
```

---

## Plain `<a>` Tags (no router)

Just swap `<Link>` for `<a>`. Works for hash-anchored single-page sites too.

```tsx
<CircularMenu
  links={[
    { to: '#home', label: 'Home' },
    { to: '#about', label: 'About' },
    { to: '#contact', label: 'Contact' },
  ]}
  openIcon={<HamburgerIcon />}
  closeIcon={<CloseIcon />}
  renderLink={(link, props) => <a href={link.to} {...props}>{link.label}</a>}
/>
```

---

## Force Dark Theme

Ignore the OS setting and always render dark pills.

```tsx
<CircularMenu
  links={links}
  openIcon={<HamburgerIcon />}
  closeIcon={<CloseIcon />}
  renderLink={(link, props) => <Link to={link.to} {...props}>{link.label}</Link>}
  theme="dark"
/>
```

---

## Close on Route Change (react-router-dom)

The `key` trick: React remounts the component on every pathname change, which resets the open state and rotation.

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

## With lucide-react Icons

Lucide's `<Menu>` and `<X>` are a perfect fit.

```tsx
import { Menu, X } from 'lucide-react';

<CircularMenu
  links={links}
  openIcon={<Menu size={24} />}
  closeIcon={<X size={24} />}
  renderLink={(link, props) => <Link to={link.to} {...props}>{link.label}</Link>}
/>
```

---

## With Next.js Link

```tsx
import Link from 'next/link';

<CircularMenu
  links={links}
  openIcon={<HamburgerIcon />}
  closeIcon={<CloseIcon />}
  renderLink={(link, props) => <Link href={link.to} {...props}>{link.label}</Link>}
/>
```

---

## Faster Stagger (snappier open animation)

Default is 50ms. Cutting it to 25ms makes the fan-out feel tighter and more energetic.

```tsx
<CircularMenu
  links={links}
  openIcon={<HamburgerIcon />}
  closeIcon={<CloseIcon />}
  renderLink={(link, props) => <Link to={link.to} {...props}>{link.label}</Link>}
  staggerMs={25}
/>
```
