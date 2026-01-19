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

## Acceptance Criteria

### UI/UX

- [ ] 主题切换按钮固定在左侧边栏底部，使用合适的图标（如 Sun/Moon）
- [ ] 点击按钮后，弹出菜单出现在按钮上方
- [ ] 分段控件水平排列，包含"浅色"、"深色"、"跟随系统"三个选项
- [ ] 选中的选项有滑动指示器效果，切换时平滑移动（不是三个独立按钮）
- [ ] 点击菜单外部或选择选项后，弹出菜单自动关闭

### 功能

- [ ] 选择"浅色"后，应用立即切换为浅色主题
- [ ] 选择"深色"后，应用立即切换为深色主题
- [ ] 选择"跟随系统"后，应用主题跟随系统设置
- [ ] 在"跟随系统"模式下，当系统主题改变时，应用实时响应变化
- [ ] 主题切换时，颜色过渡平滑（200-300ms）

### 持久化

- [ ] 用户选择的主题偏好保存到本地存储
- [ ] 重启应用后，之前选择的主题自动恢复
- [ ] 启动时无主题闪烁（FOUC）

### 兼容性

- [ ] 在 macOS 上正常工作
- [ ] 在 Windows 上正常工作（如有条件测试）
- [ ] 在 Linux 上正常工作（如有条件测试）
