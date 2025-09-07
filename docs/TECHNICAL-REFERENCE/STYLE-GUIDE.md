# BX-OS Typography & Style Guide

## Overview
This style guide uses **QueueDisplay** as the benchmark for compact, production-ready typography patterns across BX-OS. The QueueDisplay component represents optimal spacing, sizing, and hierarchy for mobile-first design.

## Typography Hierarchy (Based on QueueDisplay Standards)

### Core Typography Scale
- **H1 (Page Titles)**: `text-xl font-bold` - Main page titles only
- **H2 (Section Headings)**: `text-base font-semibold` - Major content sections  
- **Student Names/Primary Content**: `text-sm font-medium` - Primary identifiers, main content
- **Labels/Secondary Content**: `text-sm font-medium` - Form labels, data labels
- **Status Badges/Chips**: `text-xs font-medium px-1.5 py-0.5` - All badges, chips, metadata
- **Timer/Supporting Info**: `text-xs text-muted-foreground` - Supporting information

### QueueDisplay Benchmark Patterns

#### Badge Sizing (STANDARD)
```tsx
// Status badges - QueueDisplay standard
<Badge variant="outline" className="text-xs px-1.5 py-0.5 whitespace-nowrap">
  Assigned
</Badge>

// Behavior chips - compact dots preferred, or small badges
<div className="w-2 h-2 rounded-full bg-behavior-color" />
```

#### Spacing Patterns (STANDARD)
```tsx
// Teacher layout (compact) - QueueDisplay standard
itemPadding: 'gap-y-0.5 px-2 py-1'
listClass: 'space-y-0.5'
containerClass: 'space-y-1'

// Grid gaps - tight spacing
gap-x-2, gap-0.5, gap-1
```

#### Typography Hierarchy (STANDARD)
```tsx
// Student name - QueueDisplay standard
<h3 className="text-sm font-medium text-foreground">
  Student Name
</h3>

// Timer/supporting info - QueueDisplay standard
<span className="text-xs text-muted-foreground">
  0:03
</span>

// Labels for compact display
<span className="text-sm font-medium">Label:</span>
```

## Component-Specific Guidelines

### Optimized Components (PRESERVE EXACTLY)
- **QueueDisplay.tsx**: Perfect benchmark - DO NOT CHANGE
- **StudentSelection.tsx**: Typography matches QueueDisplay patterns  
- **BehaviorSelection.tsx**: Button sizing and readability optimized

### Components Requiring QueueDisplay Alignment
- **ReviewScreen.tsx**: Chips should match QueueDisplay badge sizing (`text-xs px-1.5 py-0.5`)
- **CreateBSRForm.tsx**: Headers follow hierarchy but keep content readable
- **AppHeader.tsx**: Page title prominence balanced with compact navigation

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

### Mobile-First Grid Patterns (QueueDisplay Standard)
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
- Use QueueDisplay badge sizing (`text-xs px-1.5 py-0.5`) everywhere
- Match QueueDisplay spacing patterns for consistency  
- Keep mobile-first compact approach across all screens
- Use behavior dots (2x2) when possible instead of text chips

### ❌ DON'T  
- Make badges larger than `text-xs` unless absolutely necessary
- Use loose spacing that breaks mobile layout density
- Change QueueDisplay patterns - they're the proven standard
- Create oversized chips that compete with main content

## Success Criteria
- All badge/chip sizing matches QueueDisplay exactly
- Spacing maintains mobile-first density across screens  
- Typography hierarchy supports QueueDisplay's proven readability
- Layout efficiency matches production queue interface standards