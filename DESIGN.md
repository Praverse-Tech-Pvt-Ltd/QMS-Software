# Design System: NexGen QMS

Source of truth in code: `frontend/src/theme/theme.ts` (MUI theme) and `frontend/src/theme/tokens.ts`.

## Visual Theme

Scene: a QA executive working through deviation and CAPA queues on a 24-inch office monitor under fluorescent plant-office light for a full shift. That forces a light theme, but not stark white: a warm off-white canvas cuts glare, and near-black ink keeps long reading comfortable. Data-dense, restrained, flat. Borders define structure; shadows are reserved for floating layers (menus, dialogs).

Color strategy: **Restrained**. Warm-tinted neutrals, one deep indigo accent for primary actions and current selection, semantic colors only for status.

## Color Palette

Defined in OKLCH, shipped as hex (MUI cannot parse OKLCH). All text pairs pass WCAG AA.

| Role | OKLCH | Hex | Use |
|---|---|---|---|
| canvas | 0.975 0.004 85 | `#F8F7F4` | App background |
| surface | 0.995 0.002 85 | `#FEFDFC` | Tables, panels, inputs |
| sidebar | 0.955 0.006 85 | `#F2F0EC` | Navigation rail |
| border | 0.90 0.006 85 | `#E0DEDA` | Dividers, panel edges |
| border-strong | 0.82 0.008 85 | `#C6C4BE` | Input outlines |
| ink | 0.22 0.012 270 | `#181A20` | Primary text (17:1) |
| text-secondary | 0.43 0.012 270 | `#4D5057` | Body, table cells (8:1) |
| text-muted | 0.52 0.012 270 | `#666970` | Captions, meta (5.4:1) |
| accent | 0.46 0.17 275 | `#4147B4` | Primary buttons, links, selection |
| accent-hover | 0.40 0.16 275 | `#33379B` | Pressed / hover |
| accent-soft | 0.95 0.025 275 | `#E9EEFF` | Selected nav item, focus halo |
| success | 0.50 0.12 150 | `#21763C` | Closed, approved, compliant |
| warning | 0.52 0.12 65 | `#975800` | Due soon, pending review |
| error | 0.52 0.18 25 | `#BA2B2E` | Overdue, critical, rejected |
| info | 0.50 0.09 240 | `#2B6991` | In progress, informational |

Each semantic color has a `-soft` tint for chip and banner backgrounds (`#DFF6E2`, `#FFEFD1`, `#FFE7E4`, `#E0F1FE`).

## Typography

One family: the platform UI font (`"Segoe UI Variable", "Segoe UI", system-ui, -apple-system, sans-serif`). Tabular numerals in tables and figures. Fixed rem scale, ratio about 1.2:

| Token | Size | Weight | Use |
|---|---|---|---|
| h4 | 1.5rem | 600 | Page title |
| h5 | 1.25rem | 600 | Section title |
| h6 | 1rem | 600 | Panel title |
| subtitle1 | 0.875rem | 600 | Labels, emphasized cells |
| body1 | 0.875rem | 400 | Default text |
| body2 | 0.8125rem | 400 | Table cells, secondary |
| caption / overline | 0.75rem | 500 | Meta, column headers |

## Layout & Density

- 4px base unit. Page padding 24px; panel padding 16px; table cells 8px x 12px (about 40px rows).
- Sidebar 248px. Content max width 1600px.
- Radius 6px on controls and panels, 4px on chips. No nested panels.

## Components

- **Buttons:** solid accent (primary), outlined neutral (secondary), text (tertiary). 32px (small) / 36px (default). No shadows, no hover lift.
- **Panels:** surface + 1px border, no shadow. Cards only where a record is genuinely a card.
- **Tables:** sticky-style header row on canvas tint, uppercase 0.75rem column labels, row hover tint, no zebra.
- **Chips:** soft semantic tint + matching text, always with a text label (never color alone).
- **Inputs:** surface fill, border-strong outline, 2px accent focus ring.
- **Focus:** 2px accent outline with 2px offset on every interactive element (`:focus-visible`).

## Motion

150 to 200ms, `cubic-bezier(0.25, 1, 0.5, 1)` (ease-out-quart). Color, opacity and border changes only; no transforms on hover; no page-load choreography; no infinite decorative loops. All motion disabled under `prefers-reduced-motion`.
