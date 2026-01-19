# Design: Theme Switcher

## Context

Oneiria is a desktop application built with Tauri + React + TailwindCSS 4. The application currently has a hardcoded dark theme. Users need the ability to switch between light, dark, and system-following themes. The solution must integrate with the existing sidebar layout and settings persistence.

### Stakeholders

- End users who prefer different visual themes
- Users working in different lighting environments

## Goals / Non-Goals

### Goals

- Provide a theme switcher accessible from the sidebar with minimal footprint
- Implement a modern segmented control UI for theme selection
- Persist user preference using the existing Tauri store mechanism
- Support automatic system theme following
- Smooth transitions between themes

### Non-Goals

- Custom user-defined color schemes
- Per-page theme settings
- High contrast accessibility modes (future enhancement)

## Decisions

### 1. Theme Implementation Approach

**Decision**: Use CSS custom properties (CSS variables) with a class-based theme toggle on the `<html>` element.

**Rationale**:

- TailwindCSS 4 supports the `dark:` variant natively via the `dark` class
- CSS variables allow seamless theme transitions
- Class-based approach gives full control over theme state

**Alternatives considered**:

- Media query only (`prefers-color-scheme`): Rejected because it doesn't allow user override
- Multiple stylesheets: Rejected due to complexity and flash-of-unstyled-content issues

### 2. UI Component Design

**Decision**: Fixed icon button at sidebar bottom + popover with horizontal segmented control

**Rationale**:

- Icon button is unobtrusive and follows the existing sidebar icon pattern
- Popover appears above the button, maintaining spatial relationship
- Segmented control provides clear visual feedback with sliding indicator

**Visual Specification**:

```
┌─────────────────────────────────────────────┐
│        Segmented Control Popover            │
│  ┌───────────┬───────────┬─────────────┐   │
│  │   浅色    │   深色    │  跟随系统   │   │
│  └───────────┴───────────┴─────────────┘   │
│         ▲ sliding indicator                 │
└─────────────────────────────────────────────┘
         ▲
    ┌────┴────┐
    │  🌓     │  <- Theme icon button (bottom of sidebar)
    └─────────┘
```

### 3. State Management

**Decision**: Extend `settingsStore` with `theme` field, persist to Tauri store

**Rationale**:

- Reuse existing store infrastructure (`tauri-plugin-store`)
- Centralized settings management
- Settings already loaded on app startup

**Theme State Type**:

```typescript
type ThemeMode = 'light' | 'dark' | 'system';
```

### 4. System Theme Detection

**Decision**: Use `window.matchMedia('(prefers-color-scheme: dark)')` with event listener

**Rationale**:

- Standard Web API, no additional dependencies
- Real-time updates when system preference changes
- Works across all supported platforms (Windows, macOS, Linux)

### 5. Animation

**Decision**: CSS transitions for theme changes (colors, backgrounds) and segmented control slider

**Rationale**:

- Native CSS transitions are performant
- Smooth 200-300ms transitions feel responsive without being sluggish
- Slider animation provides clear visual feedback

## Component Architecture

```
AppLayout.tsx
└── ThemeSwitcher.tsx (new)
    ├── ThemeToggleButton (icon button)
    └── ThemePopover (conditional render)
        └── SegmentedControl
            ├── Option: 浅色 (light)
            ├── Option: 深色 (dark)
            └── Option: 跟随系统 (system)
```

## CSS Variables Structure

```css
:root {
  /* Light theme (default) */
  --bg-primary: theme('colors.white');
  --bg-secondary: theme('colors.neutral.100');
  --bg-sidebar: theme('colors.neutral.50');
  --text-primary: theme('colors.neutral.900');
  --text-secondary: theme('colors.neutral.600');
  --border-color: theme('colors.neutral.200');
  --accent-color: theme('colors.purple.600');
}

.dark {
  /* Dark theme */
  --bg-primary: theme('colors.neutral.950');
  --bg-secondary: theme('colors.neutral.900');
  --bg-sidebar: theme('colors.neutral.900');
  --text-primary: theme('colors.neutral.100');
  --text-secondary: theme('colors.neutral.400');
  --border-color: theme('colors.neutral.800');
  --accent-color: theme('colors.purple.500');
}
```

## Risks / Trade-offs

| Risk                             | Mitigation                                                                  |
| -------------------------------- | --------------------------------------------------------------------------- |
| Flash of incorrect theme on load | Apply theme class synchronously before React hydration via inline script    |
| Existing hardcoded dark colors   | Migrate to CSS variables incrementally; prioritize visible components first |
| Popover positioning edge cases   | Use fixed positioning relative to button; test at various window sizes      |

## Migration Plan

1. Add CSS variables for theming (light/dark)
2. Create ThemeSwitcher component
3. Extend settingsStore with theme preference
4. Update AppLayout to include ThemeSwitcher
5. Gradually migrate existing components to use CSS variables
6. Add theme initialization script to prevent FOUC

## Open Questions

None at this time - requirements are clear.
