# Car Catalogue Admin Dashboard - Design Guidelines

## Design Approach

**Selected Approach:** Design System - Material Design adapted for Admin/CMS interface

**Justification:** This is a utility-focused, data-intensive admin dashboard requiring efficiency, clarity, and consistency. Material Design provides excellent patterns for forms, data tables, and file management interfaces while maintaining professional aesthetics.

**Key Design Principles:**
- Clarity over decoration - every element serves a functional purpose
- Scannable layouts - users should quickly locate and process information
- Consistent interaction patterns - reduce cognitive load across complex workflows
- Data hierarchy - emphasize important information through visual weight

---

## Core Design Elements

### A. Color Palette

**Light Mode (Primary):**
- Primary Brand: 210 95% 45% (Professional blue for actions, headers)
- Primary Variant: 210 85% 35% (Darker blue for hover states)
- Surface: 0 0% 100% (White backgrounds)
- Surface Variant: 210 20% 98% (Light gray for cards, containers)
- Border: 210 15% 90% (Subtle borders)
- Text Primary: 220 15% 15% (Dark gray for body text)
- Text Secondary: 220 10% 45% (Medium gray for labels)
- Success: 145 60% 42% (Green for active states)
- Warning: 35 90% 55% (Orange for alerts)
- Error: 0 70% 50% (Red for validation errors)

**Dark Mode (Optional secondary):**
- Primary: 210 90% 55% (Lighter blue)
- Surface: 220 15% 12% (Dark background)
- Surface Variant: 220 15% 18% (Card backgrounds)
- Border: 220 10% 25%
- Text Primary: 0 0% 95%
- Text Secondary: 0 0% 70%

### B. Typography

**Font Family:**
- Primary: 'Inter' (Google Fonts) - Clean, highly readable for data-heavy interfaces
- Monospace: 'Roboto Mono' - For IDs, codes, technical data

**Type Scale:**
- Page Titles (h1): text-3xl font-bold (Dashboard, Brand Management)
- Section Headers (h2): text-2xl font-semibold (Total Brands, Add Brand)
- Subsection Headers (h3): text-xl font-semibold (Form sections)
- Card Titles (h4): text-lg font-medium
- Body Text: text-base font-normal (Form labels, descriptions)
- Helper Text: text-sm font-normal (Form hints, validation messages)
- Caption: text-xs font-normal (Metadata, timestamps)

**Line Heights:**
- Headings: leading-tight
- Body text: leading-relaxed
- Form fields: leading-normal

### C. Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24

**Page Structure:**
- Sidebar Navigation: w-64 (256px) fixed left
- Main Content Area: Remaining space with max-w-7xl mx-auto
- Page Padding: px-8 py-6 (desktop), px-4 py-4 (mobile)
- Card/Container Padding: p-6
- Section Spacing: space-y-8 for major sections, space-y-4 for related groups

**Grid System:**
- Form Layouts: grid grid-cols-1 md:grid-cols-2 gap-6
- Card Grids: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Table Layouts: Full width with responsive horizontal scroll

### D. Component Library

**Navigation:**
- Top App Bar: h-16, shadow-sm, fixed with brand logo and user menu
- Sidebar: Vertical navigation with icons and labels, hover state bg-primary/10
- Breadcrumbs: text-sm with chevron separators for deep navigation

**Forms:**
- Input Fields: h-10, rounded-md border-2, focus:border-primary focus:ring-2 focus:ring-primary/20
- Text Areas: min-h-32, same border styling as inputs
- Dropdowns: Custom styled select with chevron icon
- Radio Buttons: Styled with ring on selection, inline for Active/Deactivate
- File Upload: Dashed border box with upload icon, drag-and-drop area
- Rich Text Editor: Toolbar with formatting options (bold, bullets, etc.), min-h-48

**Buttons:**
- Primary CTA: bg-primary text-white rounded-md px-6 h-10 font-medium hover:bg-primary-variant
- Secondary: border-2 border-primary text-primary rounded-md px-6 h-10 hover:bg-primary/5
- Destructive: bg-error text-white (for delete actions)
- Icon Buttons: w-10 h-10 rounded-md for edit/delete actions

**Data Display:**
- Cards: bg-surface-variant rounded-lg shadow-sm p-6
- Data Tables: Striped rows (even:bg-surface-variant), hover:bg-primary/5, sticky header
- Stats Cards: Large numbers with labels, icon in corner
- List Items: Clickable rows with hover state, right-aligned action buttons

**Feedback:**
- Success Toast: bg-success text-white, slide-in from top-right
- Error Messages: text-error text-sm below invalid form fields
- Loading States: Skeleton screens for tables, spinner for buttons
- Empty States: Centered icon + text + action button

**Dynamic Sections:**
- "Add More" Pattern: Accordion-style expansion with + icon button
- Image Gallery: Grid with thumbnail preview, edit/delete overlay on hover
- FAQ Builder: Q&A pairs with remove button, + Add FAQ at bottom

### E. Animations

**Use Sparingly - Functional Only:**
- Page Transitions: Simple fade-in (duration-200)
- Dropdown Menus: slide-down with duration-150
- Modals: Scale + fade (scale-95 to scale-100)
- Button Interactions: Native hover/active states only
- Form Focus: Smooth border color transition (transition-colors)

**No Decorative Animations** - Keep interface snappy and professional

---

## Images

**Dashboard:**
- No hero images - utility-first interface
- Logo: Top left of app bar (40x40px max)
- Empty state illustrations: Simple line-art style when no data exists

**Brand/Model Management:**
- Brand Logos: Displayed as thumbnails (80x80px) in lists, larger (200x200px) in detail view
- Car Images: Grid gallery with 4:3 aspect ratio, lightbox on click
- Upload Placeholders: Dashed border box with cloud upload icon

**Image Treatment:**
- Clean, professional presentation with subtle shadows
- Rounded corners (rounded-md) for thumbnails
- Full border on upload areas for clarity
- Caption text below each image (text-sm text-secondary)

---

## Special Considerations

**ID Generation Display:**
- Auto-generated IDs shown in monospace font (font-mono)
- Non-editable fields have bg-surface-variant with lock icon
- Clear visual distinction between editable and read-only fields

**Multi-Page Forms:**
- Progress indicator at top (steps 1/2/3/4)
- Previous/Next navigation buttons at bottom
- Save Draft functionality clearly visible
- Consistent field ordering across pages

**File Upload Handling:**
- PDF icon for brochures with file size display
- Image preview for logos and photos
- Clear error states for wrong format/size
- Drag-and-drop zones with clear boundaries

**Rich Text Editors:**
- Minimal toolbar (Bold, Italic, Bullets, Numbered List)
- Character count for limited fields
- Preview mode toggle for long content