/* global React, ReactDOM */
const { useState, useMemo, useEffect, useRef, Fragment } = React;

// =============================================================
// Icon set — minimal stroke icons
// =============================================================
const Icon = ({ name, size = 16, className = "", strokeWidth = 1.75 }) => {
  const paths = {
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" /></>,
    coins: <><circle cx="9" cy="9" r="6" /><path d="M14.5 4.3a6 6 0 1 1 5.2 10.4" /><path d="M9 6v6M11 7H7.5a1.5 1.5 0 0 0 0 3h3a1.5 1.5 0 0 1 0 3H7" /></>,
    hash: <><path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 11h18" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    trash: <><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14M10 11v6M14 11v6" /></>,
    file: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6M9 14h6M9 18h4" /></>,
    download: <><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
    check: <><path d="m5 12 5 5 9-11" /></>,
    chevron: <><path d="m6 9 6 6 6-6" /></>,
    sparkle: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 8v.01M11 12h1v5h1" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" /></>,
    drag: <><circle cx="9" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="18" r="1" /></>,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
};

// =============================================================
// Atoms — all Tailwind, no custom CSS
// =============================================================
const Field = ({ label, hint, error, children, htmlFor }) => (
  <div className="flex flex-col gap-1.5 min-w-0">
    {label && (
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-ink leading-none">
        {label}
      </label>
    )}
    {children}
    {hint && !error && <p className="text-xs text-muted leading-tight">{hint}</p>}
    {error && <p className="text-xs text-danger leading-tight">{error}</p>}
  </div>
);

const Input = React.forwardRef(({ icon, suffix, className = "", invalid, ...rest }, ref) => (
  <div
    className={`group relative flex items-center rounded-md bg-input ring-1 transition
      ${invalid ? "ring-danger/60" : "ring-border"}
      focus-within:ring-2 focus-within:ring-brand/60 focus-within:bg-surface`}
  >
    {icon && (
      <span className="pl-2.5 text-muted flex items-center pointer-events-none">
        <Icon name={icon} size={15} />
      </span>
    )}
    <input
      ref={ref}
      className={`peer w-full bg-transparent px-2.5 py-[7px] text-[13.5px] text-ink placeholder:text-faded outline-none ${icon ? "pl-1.5" : ""} ${suffix ? "pr-1" : ""} ${className}`}
      {...rest}
    />
    {suffix && (
      <span className="pr-2.5 pl-1 text-xs text-muted font-medium tabular-nums">
        {suffix}
      </span>
    )}
  </div>
));

const Textarea = ({ rows = 2, className = "", invalid, ...rest }) => (
  <div
    className={`rounded-md bg-input ring-1 transition
      ${invalid ? "ring-danger/60" : "ring-border"}
      focus-within:ring-2 focus-within:ring-brand/60 focus-within:bg-surface`}
  >
    <textarea
      rows={rows}
      className={`w-full bg-transparent px-2.5 py-[7px] text-[13.5px] text-ink placeholder:text-faded outline-none resize-none ${className}`}
      {...rest}
    />
  </div>
);

const Button = ({ variant = "solid", size = "md", icon, iconRight, children, className = "", ...rest }) => {
  const base = "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition select-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = {
    sm: "h-7 px-2.5 text-xs",
    md: "h-8 px-3 text-[13px]",
    lg: "h-10 px-4 text-sm",
    xl: "h-11 px-5 text-[14.5px]",
  };
  const variants = {
    solid: "bg-brand text-white hover:bg-brand-hover active:bg-brand-active shadow-sm",
    soft: "bg-brand-soft text-brand-on hover:bg-brand-softHover",
    ghost: "text-ink hover:bg-hover",
    outline: "ring-1 ring-border text-ink bg-surface hover:bg-hover",
    danger: "text-danger hover:bg-danger-soft",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
      {icon && <Icon name={icon} size={size === "sm" ? 13 : size === "lg" || size === "xl" ? 16 : 14} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === "sm" ? 13 : size === "lg" || size === "xl" ? 16 : 14} />}
    </button>
  );
};

const Card = ({ title, eyebrow, action, children, dense, className = "" }) => (
  <section className={`rounded-xl bg-surface ring-1 ring-border shadow-sm overflow-hidden ${className}`}>
    {(title || action) && (
      <header className={`flex items-center justify-between gap-3 border-b border-border ${dense ? "px-4 py-3" : "px-5 py-4"}`}>
        <div className="flex flex-col gap-0.5 min-w-0">
          {eyebrow && <span className="text-[11px] uppercase tracking-[0.08em] font-semibold text-muted">{eyebrow}</span>}
          {title && <h2 className="text-[15px] font-semibold text-ink leading-tight truncate">{title}</h2>}
        </div>
        {action}
      </header>
    )}
    <div className={dense ? "p-4" : "p-5"}>{children}</div>
  </section>
);

const Kbd = ({ children }) => (
  <kbd className="inline-flex items-center px-1.5 h-5 rounded text-[11px] font-medium ring-1 ring-border bg-input text-muted tabular-nums">
    {children}
  </kbd>
);

const Avatar = ({ name }) => {
  const initials = name.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase() || "U";
  return (
    <div className="size-8 rounded-full bg-brand-soft text-brand-on grid place-items-center text-xs font-semibold ring-1 ring-brand/15">
      {initials}
    </div>
  );
};

// =============================================================
// Helpers
// =============================================================
const fmtPLN = (n) =>
  (Number.isFinite(n) ? n : 0)
    .toFixed(2)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");

const parsePLN = (s) => {
  if (typeof s !== "string") return Number(s) || 0;
  const cleaned = s.replace(/\s/g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
};

const fmtHours = (n) => (Number.isFinite(n) ? n : 0).toFixed(1).replace(".", ",");

Object.assign(window, {
  Icon, Field, Input, Textarea, Button, Card, Kbd, Avatar,
  fmtPLN, parsePLN, fmtHours,
});
