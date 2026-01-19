# Change: Add Theme Switcher with Segmented Control

## Why

Users need the ability to customize the application's visual appearance to match their preferences or environment. A theme switcher with Light/Dark/System options provides flexibility while following modern desktop application standards.

## What Changes

- Add a theme toggle button to the bottom of the left sidebar
- Implement a popover menu with a segmented control containing three options: Light (浅色), Dark (深色), System (跟随系统)
- Add CSS custom properties (CSS variables) for theming both light and dark modes
- Extend the settings store to persist the user's theme preference
- Implement logic to apply the selected theme class to the root element
- Support system preference detection via `prefers-color-scheme` media query

## Impact

- **Affected specs**: New capability `theme-switch`
- **Affected code**:
  - `src/components/layout/AppLayout.tsx` - Add theme toggle button
  - `src/stores/settingsStore.ts` - Add theme preference state
  - `src/index.css` - Add CSS variables for light/dark themes
  - `src/App.tsx` - Update Toaster theme to follow app theme
  - New component: `src/components/ui/ThemeSwitcher.tsx` - Segmented control UI
