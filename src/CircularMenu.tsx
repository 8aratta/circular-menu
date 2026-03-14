import React, { useState, useCallback, useId } from "react";
import "./CircularMenu.css";
import { CircularMenuItem, CircularMenuItemProps } from "./CircularMenuItem";

export interface CircularMenuProps {
  /** Array of menu item configurations */
  items: CircularMenuItemProps[];
  /** Radius of the circle in pixels (default: 100) */
  radius?: number;
  /** Starting angle in degrees (default: 0, top of circle) */
  startAngle?: number;
  /** Icon / content for the center toggle button */
  triggerIcon?: React.ReactNode;
  /** aria-label for the center toggle button (default: "Open menu") */
  triggerAriaLabel?: string;
  /** Size of the center trigger button in pixels (default: 56) */
  triggerSize?: number;
  /** Size of each menu item button in pixels (default: 48) */
  itemSize?: number;
  /** Additional CSS class for the root element */
  className?: string;
  /** Controls open state externally; leave undefined for uncontrolled mode */
  open?: boolean;
  /** Called whenever the open state changes (in uncontrolled mode) */
  onOpenChange?: (open: boolean) => void;
}

export function CircularMenu({
  items,
  radius = 100,
  startAngle = 0,
  triggerIcon = "+",
  triggerAriaLabel = "Open menu",
  triggerSize = 56,
  itemSize = 48,
  className = "",
  open: controlledOpen,
  onOpenChange,
}: CircularMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const id = useId();

  const toggle = useCallback(() => {
    const next = !isOpen;
    if (!isControlled) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  }, [isOpen, isControlled, onOpenChange]);

  const itemCount = items.length;
  const angleStep = itemCount > 1 ? 360 / itemCount : 0;

  return (
    <div
      className={`circular-menu${isOpen ? " circular-menu--open" : ""}${className ? ` ${className}` : ""}`}
      style={
        {
          "--circular-menu-radius": `${radius}px`,
          "--circular-menu-trigger-size": `${triggerSize}px`,
          "--circular-menu-item-size": `${itemSize}px`,
        } as React.CSSProperties
      }
      role="navigation"
      aria-label={triggerAriaLabel}
    >
      <button
        id={`${id}-trigger`}
        type="button"
        className="circular-menu__trigger"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={`${id}-list`}
        aria-label={triggerAriaLabel}
      >
        <span
          className="circular-menu__trigger-icon"
          aria-hidden="true"
        >
          {triggerIcon}
        </span>
      </button>

      <ul
        id={`${id}-list`}
        className="circular-menu__list"
        role="menu"
        aria-labelledby={`${id}-trigger`}
      >
        {items.map((item, index) => {
          const angleDeg = startAngle + index * angleStep;
          const angleRad = (angleDeg - 90) * (Math.PI / 180);
          const x = Math.round(Math.cos(angleRad) * radius);
          const y = Math.round(Math.sin(angleRad) * radius);

          return (
            <li
              key={index}
              className="circular-menu__list-item"
              role="none"
              style={{
                transform: isOpen
                  ? `translate(${x}px, ${y}px) scale(1)`
                  : "translate(0, 0) scale(0)",
                opacity: isOpen ? 1 : 0,
                transitionDelay: isOpen
                  ? `${index * 30}ms`
                  : `${(itemCount - 1 - index) * 30}ms`,
              }}
            >
              <CircularMenuItem role="menuitem" {...item} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
