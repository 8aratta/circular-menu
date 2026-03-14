# circular-menu

A lightweight, accessible, and fully customizable **circular / radial menu** React component.

![npm version](https://img.shields.io/npm/v/@8aratta/circular-menu)
![license](https://img.shields.io/npm/l/@8aratta/circular-menu)

---

## Features

- 🎯 **Radial layout** – menu items fan out in a circle around a center trigger
- 🎨 **Customizable** – radius, angles, sizes, colors via CSS custom properties
- ♿ **Accessible** – full ARIA roles, keyboard focus, `aria-expanded` state
- 📦 **Tiny** – zero runtime dependencies (only peer `react`/`react-dom`)
- 💪 **TypeScript** – fully typed exports

---

## Installation

```bash
npm install @8aratta/circular-menu
# or
yarn add @8aratta/circular-menu
```

React 17+ and React-DOM are required as peer dependencies.

---

## Usage

### Basic example

```tsx
import { CircularMenu } from "@8aratta/circular-menu";
import "@8aratta/circular-menu/dist/circular-menu.css";

const items = [
  { label: "Home",     icon: "🏠", onClick: () => console.log("home") },
  { label: "Search",   icon: "🔍", onClick: () => console.log("search") },
  { label: "Profile",  icon: "👤", onClick: () => console.log("profile") },
  { label: "Settings", icon: "⚙️", onClick: () => console.log("settings") },
];

export default function App() {
  return (
    <CircularMenu
      items={items}
      radius={110}
      triggerIcon="☰"
      triggerAriaLabel="Open navigation"
    />
  );
}
```

### Controlled mode

```tsx
const [open, setOpen] = React.useState(false);

<CircularMenu
  items={items}
  open={open}
  onOpenChange={setOpen}
/>
```

---

## API

### `<CircularMenu>`

| Prop               | Type                       | Default          | Description                                           |
| ------------------ | -------------------------- | ---------------- | ----------------------------------------------------- |
| `items`            | `CircularMenuItemProps[]`  | **required**     | Array of item configuration objects                  |
| `radius`           | `number`                   | `100`            | Distance (px) from center to each item                |
| `startAngle`       | `number`                   | `0`              | Starting angle in degrees (0 = top)                   |
| `triggerIcon`      | `ReactNode`                | `"+"`            | Content rendered inside the center trigger button     |
| `triggerAriaLabel` | `string`                   | `"Open menu"`    | `aria-label` for the trigger button                   |
| `triggerSize`      | `number`                   | `56`             | Diameter (px) of the trigger button                   |
| `itemSize`         | `number`                   | `48`             | Diameter (px) of each item button                     |
| `className`        | `string`                   | `""`             | Extra CSS class applied to the root element           |
| `open`             | `boolean`                  | `undefined`      | Controlled open state (uncontrolled when omitted)     |
| `onOpenChange`     | `(open: boolean) => void`  | `undefined`      | Called when open state changes                        |

### `<CircularMenuItem>`

| Prop        | Type            | Default     | Description                                    |
| ----------- | --------------- | ----------- | ---------------------------------------------- |
| `label`     | `string`        | `undefined` | Text label displayed in the button             |
| `icon`      | `ReactNode`     | `undefined` | Icon element rendered inside the button        |
| `onClick`   | `() => void`    | `undefined` | Click handler                                  |
| `className` | `string`        | `""`        | Extra CSS class                                |
| `disabled`  | `boolean`       | `false`     | Disables the button                            |
| `ariaLabel` | `string`        | `label`     | Overrides the accessible name                  |

---

## Theming

Override CSS custom properties on the `.circular-menu` element (or `:root`) to customise colours:

```css
.circular-menu {
  --circular-menu-trigger-bg: #e63946;
  --circular-menu-trigger-color: #ffffff;
  --circular-menu-item-bg: #f1faee;
  --circular-menu-item-color: #1d3557;
  --circular-menu-item-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  --circular-menu-transition-duration: 300ms;
}
```

---

## Development

```bash
# Install deps
npm install

# Run tests
npm test

# Build
npm run build
```

---

## License

MIT © [8aratta](https://github.com/8aratta)
