# BX-OS Typography & Style Guide

## Overview
This style guide documents BX-OS typography hierarchy and design patterns, emphasizing preservation of existing optimized components while standardizing inconsistencies.

## Typography Hierarchy

### Header Hierarchy
- **H1 (Page Titles)**: `text-xl font-bold` - Main page titles, app header
- **H2 (Section Headings)**: `text-lg font-semibold` - Major content sections
- **H3 (Subsection Headings)**: `text-base font-semibold` - Minor sections ("Current Mood", step headers)
- **H4 (Labels)**: `text-sm font-medium` or `text-sm font-semibold` - Form labels, data labels
- **Body (Content)**: `text-sm font-normal` - General content, descriptions
- **Caption (Chips/Badges)**: `text-xs font-medium` - Small chips, metadata

### Visual Hierarchy Rules
1. **Labels must be more prominent than their associated chips/badges**
2. **Content text should be readable and accessible**
3. **Headers should establish clear information architecture**

## Component-Specific Guidelines

### Optimized Components (DO NOT CHANGE)
These components have been carefully optimized and should be preserved:

- **QueueDisplay.tsx**: Typography and spacing are production-ready
- **StudentSelection.tsx**: Visual hierarchy is properly established
- **BehaviorSelection.tsx**: Button readability is optimized
- **Badge components**: Existing badge systems are working well

### Components Requiring Standardization
- **CreateBSRForm.tsx**: Standardize page title and section headings
- **EmptyState.tsx**: Ensure consistent header hierarchy
- **ReviewScreen.tsx**: Fix chip-to-label hierarchy relationship

## Design Tokens Usage
- Use semantic tokens from `index.css` and `tailwind.config.ts`
- Always use HSL color functions
- Avoid direct color values in components
- Leverage design system gradients and shadows

## Implementation Strategy
- **Surgical changes only**: Fix specific hierarchy issues without breaking working patterns
- **Preserve existing optimized interfaces**: Don't change what's working
- **Document exceptions**: Some components have specialized requirements
- **Maintain consistency**: Apply standards consistently across similar use cases

## Badge & Chip Systems
- **Primary chips** (selected): `text-xs font-medium px-2 py-0.5`
- **Secondary badges**: `text-xs font-normal px-2 py-0.5`
- **Labels for chips**: `text-sm font-semibold` (more prominent than associated chips)

## When NOT to Change Typography
- If the component is already production-ready and optimized
- If the typography serves a specific functional purpose
- If changing would break established user workflows
- If the component has specialized interface requirements

## Success Criteria
- Clear visual hierarchy between page titles, sections, labels, and content
- Labels are more prominent than their associated chips/badges
- Consistent header patterns across similar components
- Preserved functionality of optimized components