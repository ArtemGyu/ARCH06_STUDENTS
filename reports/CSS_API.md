# CSS API · Atlas UI

HTML5 + CSS layers/custom properties + JavaScript ES modules. No build step or UI framework.

## Cascade contract

`reset → legacy → tokens → base → components → states → utilities`.
`legacy.vendor-v2` is a nested layer within the early legacy boundary. All imports are layered. Normal declarations in later layers win before specificity is compared. Important declarations reverse layer priority; this project forbids them. IDs are reserved for anchors and JS.

## Public classes and ownership

| Family | Public variants | States and contract |
|---|---|---|
| `.ui-button` | `--primary`, `--secondary`, `--ghost`, `--danger`; `--sm`, default md, `--lg` | Native button, or anchor for navigation. Hover/active exclude disabled. `:focus-visible`; native `disabled` only on button. |
| `.ui-field` | `--full` layout slot | Direct label, input/textarea, `.ui-field__hint`; connect via for/id and aria-describedby. JS sets aria-invalid on blur/submit and repairs it on input. |
| `.ui-card` | default, `--featured` | Owns direct h3/p/meta/button. `.ui-card__meta` slot. Does not restyle nested alerts/cards. Inline-size container `card`. |
| `.ui-tag` | `--neutral`, `--success`, `--warning`, `--danger`, `--paused` | Static text; no click handler, hover cue or tabindex. |
| `.ui-alert` | `--info`, `--success`, `--warning`, `--danger`, `--paused` | Content in a div; optional `.ui-alert__dismiss` button with accessible name. status for advisory messages, alert for urgent errors. |
| `.ui-switch` | checkbox checked / unchecked / disabled | Label wraps copy + native input + track + thumb. Preserve sibling order. Tab/Space are native. |
| `.ui-dialog` | closed / modal | Native dialog with labelledby and describedby; open via showModal(); method=dialog handles buttons, Escape and trigger focus are verified. |

## Consumer variables

Use semantic roles from `tokens.css`: `--color-canvas`, `--color-surface`, `--color-surface-alt`, `--color-ink`, `--color-muted`, `--color-border`, `--color-accent`, `--color-accent-hover`, `--color-accent-ink`, `--color-focus`, and status roles `--color-{danger,success,warning,info,paused}` + `-bg`. Danger buttons use `--color-danger-ink` and `--color-danger-hover`. Sizes: `--control-height`, `--radius-*`, `--space-*`, `--motion-fast`.

Select theme with `html[data-theme=light|dark]`. Change theme colors only in tokens. A consumer may override semantic variables at an explicit subtree boundary, and must check contrast of the resulting pairs. Do not use `.is-danger` or selectors tied to workbench IDs.

## Narrow card behavior

The card establishes an inline-size container. At content width <=400px its direct button fills the content slot. A wider card uses automatic button width. Buttons outside cards retain their own width. A viewport query is not equivalent: a narrow card can appear on a wide desktop.

## Vendor boundary

Contractor rules are prefixed with `.legacy-widget`, then imported in early layers. The original widget and its stylesheet remain in the project. Library class names keep their contract even if used inside a vendor subtree: the later components layer wins. To preserve contractor styling, use `.legacy-action` instead. No unlayered external stylesheets are allowed.

## Motion and limitations

Reduced-motion removes transitions and hover translation while checked-state position remains functional. Forced-colors adds switch boundaries. Modern browsers with layers, :has(), dialog and container queries are required. Current automated proof is Chromium; Firefox/Safari and screen-reader review remain separate checks.
