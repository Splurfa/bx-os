# BX-OS Typography & Style Guide

## Overview
This style guide defines consistent typography patterns for BX-OS components. It focuses on mobile-first design principles with semantic tokens from the design system.

## Typography Hierarchy (Based on QueueDisplay Standards)

### Core Typography Scale
- **H1 (Page Titles)**: `text-xl font-bold` - Main page titles only
- **H2 (Section Headings)**: `text-base font-semibold` - Major content sections  
- **Student Names/Primary Content**: `text-sm font-medium` - Primary identifiers, main content
- **Labels/Secondary Content**: `text-sm font-medium` - Form labels, data labels
- **Status Badges/Chips**: `text-xs font-medium px-1.5 py-0.5` - All badges, chips, metadata
- **Timer/Supporting Info**: `text-xs text-muted-foreground` - Supporting information

### Standard Component Patterns

#### Badge Sizing (STANDARD)
```tsx
// Status badges - consistent sizing
<Badge variant="outline" className="text-xs px-1.5 py-0.5 whitespace-nowrap">
  Assigned
</Badge>

// Behavior indicators - use semantic design tokens
<div className="w-2 h-2 rounded-full bg-primary" />
```

#### Spacing Patterns (STANDARD)
```tsx
// Compact layout patterns
itemPadding: 'gap-y-0.5 px-2 py-1'
listClass: 'space-y-0.5'
containerClass: 'space-y-1'

// Grid gaps - mobile-first
gap-x-2, gap-0.5, gap-1
```

#### Typography Hierarchy (STANDARD)
```tsx
// Primary content
<h3 className="text-sm font-medium text-foreground">
  Student Name
</h3>

// Supporting information
<span className="text-xs text-muted-foreground">
  Supporting Info
</span>

// Labels and metadata
<span className="text-sm font-medium">Label:</span>
```

## Component-Specific Guidelines

### Component Standards

#### Consistent Components
- **StudentSelection.tsx**: Typography follows standard patterns  
- **BehaviorSelection.tsx**: Button sizing and readability optimized
- **QueueDisplay.tsx**: Real-time queue interface with mobile-first design

#### Component Guidelines
- **ReviewScreen.tsx**: Badge sizing should use standard (`text-xs px-1.5 py-0.5`)
- **CreateBSRForm.tsx**: Headers follow hierarchy, maintain content readability
- **AppHeader.tsx**: Balance page title prominence with compact navigation

## Compact Design Principles

### 1. Badge/Chip Consistency
- **All status indicators**: `text-xs px-1.5 py-0.5`
- **All behavior tags**: Either `w-2 h-2` dots or `text-xs` badges
- **No oversized chips**: Everything subordinate to main content

### 2. Spacing Efficiency  
- **Grid gaps**: `gap-x-2` for columns, `gap-0.5` to `gap-1` for tight elements
- **Padding**: `px-2 py-1` for list items, `px-1.5 py-0.5` for badges
- **Container spacing**: `space-y-1` maximum between sections

### 3. Typography Hierarchy
- **Primary content**: `text-sm font-medium` (student names, main data)
- **Labels**: `text-sm font-medium` or `text-sm font-semibold` (brief emphasis)
- **Supporting info**: `text-xs text-muted-foreground` (timers, metadata)
- **Status/chips**: `text-xs font-medium` (all badges and tags)

## Layout Direction Standards

### Mobile-First Grid Patterns
```tsx
// Compact 2-column, 2-row grid
className="grid grid-cols-[minmax(0,1fr)_auto] grid-rows-2 gap-x-2"

// Row/column assignments
col-[1] row-[1]  // Main content, top
col-[1] row-[2]  // Supporting info, bottom  
col-[2] row-[1]  // Actions, top-right
col-[2] row-[2]  // Secondary status, bottom-right
```

### Responsive Patterns
- **Mobile**: Abbreviated names, compact badges, minimal padding
- **Desktop**: Full names visible, same badge sizing maintained
- **Consistent**: Badge sizes never change between breakpoints

## Implementation Rules

### ✅ DO
- Use standard badge sizing (`text-xs px-1.5 py-0.5`) consistently
- Follow spacing patterns for visual consistency  
- Keep mobile-first compact approach across all screens
- Use semantic design tokens instead of direct colors

### ❌ DON'T  
- Make badges larger than `text-xs` unless absolutely necessary
- Use loose spacing that breaks mobile layout density
- Use direct colors instead of semantic tokens
- Create oversized elements that compete with main content

## Success Criteria
- All badge/chip sizing follows standard patterns consistently
- Spacing maintains mobile-first density across screens  
- Typography hierarchy supports readability and accessibility
- Layout efficiency optimized for iPad kiosk and mobile teacher interfaces