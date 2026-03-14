# @8aratta/circular-menu

A radial circular menu for React with carousel mode, momentum physics, and a liquid glass visual effect.

## Installation

```bash
npm install @8aratta/circular-menu
```

Import the stylesheet once in your app entry point:

```ts
import '@8aratta/circular-menu/dist/style.css';
```

### Peer dependencies

```bash
npm install react react-dom
```

## Basic usage

```tsx
import { CircularMenu } from '@8aratta/circular-menu';
import { Link } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/work', label: 'Work' },
  { to: '/contact', label: 'Contact' },
];

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

## Using without a router

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

## Closing on route change (react-router-dom)

The menu does not auto-close on navigation. Pass `key={location.pathname}` to remount the component on each route change:

```tsx
import { useLocation } from 'react-router-dom';

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

## Carousel + momentum

```tsx
<CircularMenu
  links={links}
  openIcon={<HamburgerIcon />}
  closeIcon={<CloseIcon />}
  renderLink={(link, props) => (
    <Link to={link.to} {...props}>{link.label}</Link>
  )}
  carousel
  emphasize="bottom"
  snap
  carryMomentum
  introSpin
  emphasisScale={1.33}
  neutralScale={0.75}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `links` | `NavLink[]` | **required** | Array of `{ to: string; label: string }` |
| `renderLink` | `(link: NavLink, props: LinkRenderProps) => ReactNode` | **required** | Render function for each menu item. Spread `props` onto your `<Link>` or `<a>`. |
| `openIcon` | `ReactNode` | **required** | Icon shown when the menu is closed (hamburger) |
| `closeIcon` | `ReactNode` | **required** | Icon shown when the menu is open (X / close) |
| `theme` | `'light' \| 'dark'` | OS preference | Override the color theme |
| `radius` | `number` | `130` | Radius in px of the radial arc |
| `angle` | `number \| 'top' \| 'right' \| 'bottom' \| 'left'` | `225` | Central focal angle of the arc |
| `startAngle` | `number` | — | Manual start angle in degrees (overrides `angle`) |
| `endAngle` | `number` | — | Manual end angle in degrees (overrides `angle`) |
| `staggerMs` | `number` | `50` | Stagger delay in ms between each opening item |
| `carousel` | `boolean` | `false` | Enable 360° draggable carousel mode |
| `emphasize` | `boolean \| number \| 'top' \| 'right' \| 'bottom' \| 'left'` | `false` | Scale up items as they rotate to this angle |
| `snap` | `boolean` | `false` | Smooth-snap the nearest item to the emphasis angle on release |
| `emphasisScale` | `number` | — | Scale factor for the emphasized item (e.g. `1.33`) |
| `neutralScale` | `number` | — | Scale factor for the opposite-side items for a continuous gradient (e.g. `0.75`) |
| `carryMomentum` | `boolean` | `false` | Apply angular momentum on drag release (fortune-wheel spin-down) |
| `introSpin` | `boolean` | `false` | Play a spin flourish when the menu first opens |

## License

MIT