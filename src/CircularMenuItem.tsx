import React from "react";

export interface CircularMenuItemProps {
  /** Label text displayed beneath the icon */
  label?: string;
  /** Icon element or any React node to render inside the item button */
  icon?: React.ReactNode;
  /** Called when the item is clicked */
  onClick?: () => void;
  /** Additional CSS class name */
  className?: string;
  /** Disable interaction on this item */
  disabled?: boolean;
  /** aria-label for accessibility (defaults to label) */
  ariaLabel?: string;
  /** WAI-ARIA role override */
  role?: React.AriaRole;
}

export function CircularMenuItem({
  label,
  icon,
  onClick,
  className = "",
  disabled = false,
  ariaLabel,
  role,
}: CircularMenuItemProps) {
  return (
    <button
      type="button"
      role={role}
      className={`circular-menu__item${className ? ` ${className}` : ""}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={ariaLabel ?? label}
    >
      {icon && <span className="circular-menu__item-icon">{icon}</span>}
      {label && <span className="circular-menu__item-label">{label}</span>}
    </button>
  );
}
