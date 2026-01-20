# Sidebar Expansion Implementation Plan

## Objective

Enhance the application's left sidebar to support an innovative expandable/collapsible state.

- **Collapsed State**: Displays only icons (current behavior).
- **Expanded State**: Displays icons with text labels (e.g., "Library" next to the Library icon).
- **Toggle Mechanism**: A dedicated button to switch between states.

## Impact Analysis

- **File**: `src/components/layout/AppLayout.tsx`
- **Logic**: minimal logic change (UI state only).
- **Styling**: Significant CSS class updates for transitions and layout properties.

## Proposed Changes

### 1. State Management

Introduce a local state variable in `AppLayout` to track the sidebar mode.

```tsx
const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
```

### 2. Layout & Styling Strategy

Use Tailwind CSS classes with dynamic conditions for smooth transitions.

**Sidebar Container (`aside`):**

- **Base**: `flex flex-col border-r transition-all duration-300 ease-in-out`
- **Collapsed**: `w-16 items-center`
- **Expanded**: `w-64` (allows space for text)

**Navigation Items (`NavLink`):**

- **Container**: Flexbox row.
- **Collapsed**: `justify-center p-3`
- **Expanded**: `justify-start px-4 gap-3`
- **Text Label**:
  - Use a `span` element.
  - Implement smooth fade-in/out using `opacity` and `width`.
  - Class logic: `overflow-hidden whitespace-nowrap transition-all duration-300`
  - Expanded: `opacity-100 w-auto ml-3`
  - Collapsed: `opacity-0 w-0`

### 3. New Components

**Toggle Button**:

- Add a new button (likely `PanelLeftOpen` / `PanelLeftClose` or `ChevronRight`/`ChevronLeft` from `lucide-react`) to trigger the expansion.
- **Placement**: Recommended at the bottom of the navigation list or replacing the top logo area's static nature. Given the current layout, placing it at the top (next to logo) or bottom (above settings/footer) is best.
- **Recommendation**: Place it near the top logo or as the last item in the main nav list for easy access.

### 4. Footer Adjustments

The `LanguageSwitcher` and `ThemeSwitcher` currently reside in a centered flex column at the bottom.

- **Collapsed**: Keep current centered stack.
- **Expanded**: Can remain centered or switch to a row layout. For simplicity and aesthetics, keeping them as icon-only popovers works well, or we can align them purely to the left.
- **Plan**: Keep them visually consistent (row or column) but align the container to match the sidebar's padding.

## Step-by-Step Execution Plan

1.  **Prepare State & Imports**:
    - Import `PanelLeft`, `PanelLeftClose` (or similar) from `lucide-react`.
    - Initialize `isSidebarExpanded` state.

2.  **Add Toggle Button**:
    - Insert the toggle button into the DOM (e.g., near the logo or at the bottom of the nav section).
    - Wire up the `onClick` handler.

3.  **Refactor Sidebar Width**:
    - Change `w-16` to a conditional `` `${isSidebarExpanded ? 'w-64' : 'w-16'}` ``.
    - Ensure `transition-all` is applied.

4.  **Update Navigation Links**:
    - Wrap the icon and text in a flex container.
    - Add the text label `span` with the transition classes described above.
    - Update `justify` classes based on state (`center` vs `start`).

5.  **Verify & Polish**:
    - Test smooth animations.
    - Ensure "Resource Library" text fits and truncates if necessary (though w-64 should be plenty).
    - Verify `LanguageSwitcher` and `ThemeSwitcher` behavior.

## Draft Code Snippet (Preview)

```tsx
<aside
  className={cn(
    'flex flex-col border-r transition-all duration-300 bg-[var(--bg-sidebar)]',
    isSidebarExpanded ? 'w-64' : 'w-16 items-center'
  )}
>
  {/* Header / Toggle */}
  <div className="flex h-16 items-center justify-center w-full relative">
    <div className="font-bold text-xl text-[var(--accent-color)]">
      {isSidebarExpanded ? 'Oneiria' : 'D'}
    </div>
    <button
      onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
      className="absolute right-[-12px] top-6 bg-[var(--bg-primary)] border rounded-full p-1 hover:bg-[var(--bg-secondary)]"
    >
      {/* Icon */}
    </button>
  </div>

  {/* Nav Items */}
  {navItems.map((item) => (
    <NavLink
      className={cn(
        'flex items-center',
        isSidebarExpanded ? 'justify-start px-4' : 'justify-center p-3'
      )}
    >
      <item.icon />
      <span
        className={cn(
          'transition-all overflow-hidden',
          isSidebarExpanded ? 'w-auto opacity-100 ml-3' : 'w-0 opacity-0'
        )}
      >
        {item.label}
      </span>
    </NavLink>
  ))}

  {/* ... Footer ... */}
</aside>
```
