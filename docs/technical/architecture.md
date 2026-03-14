# 🏗️ Architecture

How the package is put together — file layout, data flow, build output, and the decisions behind the design.

---

## Package Layout

```
@8aratta/circular-menu
├── src/
│   ├── index.ts                        ← public exports (component + types)
│   ├── types.ts                        ← everything you import when you use TypeScript
│   ├── declarations.d.ts               ← CSS module shim so tsc doesn't complain
│   ├── CircularMenu.tsx                ← the main show
│   ├── components/
│   │   └── MenuItem.tsx                ← one animated pill per nav link
│   ├── hooks/
│   │   ├── useMenuState.ts             ← open/close + scroll lock
│   │   ├── useCarouselInteraction.ts   ← drag, scroll, momentum, snap
│   │   └── useLiquidGlass.ts           ← SVG filter injection (lazy)
│   ├── utils/
│   │   ├── mathUtils.ts                ← pure geometry helpers
│   │   └── liquidGlass.ts              ← builds the SVG displacement filter
│   └── styles/
│       ├── base.module.css             ← wrapper + container positioning
│       ├── button.module.css           ← the hamburger toggle button
│       ├── menuItem.module.css         ← pills — glass layers, states, theming
│       └── animations.module.css       ← the idle-hint keyframe
└── dist/                               ← what ships in the npm tarball
    ├── circular-menu.es.js             ← ES module (tree-shakeable)
    ├── circular-menu.cjs.js            ← CommonJS for older toolchains
    ├── circular-menu.css               ← all styles in one file
    └── **/*.d.ts                       ← type declarations, mirrored directory structure
```

---

## Data Flow

A mental model for tracing props through the component tree:

```
CircularMenuProps
        │
        ▼
   CircularMenu
   ├── useMenuState          → isOpen, toggle(), scroll lock side-effect
   ├── useCarouselInteraction → rotation, per-item transforms, pointer handlers  (carousel only)
   ├── useLiquidGlass         → one-time SVG filter injection on first open
   ├── theme resolution       → 'light' | 'dark' via prop or matchMedia
   │
   └── renders:
       ├── .menuWrapper          (the relative positioning anchor)
       ├── .circularMenu         (absolute, centred, rotated ring)
       │   └── MenuItem × N
       │       └── renderLink(link, linkRenderProps)
       └── toggle <button>       (open / close — always visible)
```

---

## Build Output

| File | Format | Notes |
|------|--------|------|
| `circular-menu.es.js` | ESM | Tree-shakeable. Use this one. |
| `circular-menu.cjs.js` | CJS | For Node and older toolchains |
| `circular-menu.css` | CSS | Import once. All styles, one file. |
| `index.d.ts` | Types | Re-exports everything |
| `CircularMenu.d.ts` | Types | Component props |
| `types.d.ts` | Types | `NavLink`, `CircularMenuProps`, etc. |
| `components/MenuItem.d.ts` | Types | Internal (exposed for advanced use) |
| `hooks/*.d.ts` | Types | Three hook signatures |
| `utils/*.d.ts` | Types | Utility function signatures |

**Peer deps** (not bundled — you bring these): `react >=17`, `react-dom >=17`.\
**Zero runtime dependencies** — no react-router-dom, no CSS-in-JS, nothing extra.

---

## Public API

Everything that ships in `src/index.ts`:

```ts
// Component
export { default as CircularMenu } from './CircularMenu';

// Types
export type { NavLink, CircularMenuProps, LinkRenderProps, PositionEntry } from './types';
```

Internal modules (hooks, utils, `MenuItem`) aren't in the barrel export but their `.d.ts` files are in `dist/` if you need them for something exotic.

---

## Design Decisions

| Decision | Why |
|----------|-----|
| `renderLink` prop instead of bundling react-router-dom | Router-agnostic. Works with any link component — react-router, Next.js, plain `<a>`, TanStack Router. |
| `openIcon` / `closeIcon` as `ReactNode` | Consumers bring their own icons; no asset-bundling headaches, no forced icon library. |
| `theme` prop + `prefers-color-scheme` fallback | Component works standalone without a global theme context. |
| `position: absolute` wrapper | No assumption about viewport placement — the consumer decides where to put it. |
| `key={pathname}` for route-change close | Avoids any router dependency while still giving the canonical "close on navigate" UX. |
| CSS Modules bundled to single `.css` | No runtime style injection; works with any bundler; import once and done. |
| Vite library mode + vite-plugin-dts | Fast builds, accurate generated types, zero manual type wrangling. |
