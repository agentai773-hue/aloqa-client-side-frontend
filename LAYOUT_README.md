# Layout Structure

This project uses a modern admin dashboard layout with:

## Components

### 1. **Sidebar** (`src/components/Sidebar.tsx`)
- Fixed sidebar on desktop (left side)
- Collapsible on mobile with overlay
- Navigation menu with emoji icons
- User profile section at bottom
- Responsive design with hamburger menu toggle

### 2. **Header** (`src/components/Header.tsx`)
- Sticky header at the top
- Search bar
- Notification bell with badge
- User profile button
- Responsive layout

### 3. **Layout** (`src/app/layout.tsx`)
- Integrates Sidebar and Header
- Main content area with proper spacing
- Responsive flexbox layout
- Desktop: Sidebar (fixed) + Content area (with header)
- Mobile: Collapsible sidebar + Content area

## Layout Structure

```
┌─────────────────────────────────────────────┐
│              Fixed Sidebar                  │
│  ┌──────────────────────────────────────┐  │
│  │         Admin Panel                   │  │
│  ├──────────────────────────────────────┤  │
│  │  🏠 Dashboard                         │  │
│  │  👥 Users                             │  │
│  │  📄 Documents                         │  │
│  │  📊 Analytics                         │  │
│  │  ⚙️ Settings                          │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│              Header (Sticky)                 │
│  [🔍 Search...] [🔔] [👤 Admin]             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│           Main Content Area                  │
│  (Children components render here)           │
│                                               │
└─────────────────────────────────────────────┘
```

## Features

- ✅ Responsive design (mobile & desktop)
- ✅ Fixed sidebar navigation
- ✅ Sticky header
- ✅ Mobile hamburger menu
- ✅ Emoji icons (no external dependencies)
- ✅ Clean, modern UI with Tailwind CSS
- ✅ Proper spacing and layout

## Customization

### Adding Navigation Items
Edit `src/components/Sidebar.tsx` and add to the `navigation` array:

```typescript
const navigation = [
  { name: "Your Page", href: "/your-page", icon: "🎯" },
  // ... other items
];
```

### Styling
All components use Tailwind CSS classes. Modify the classes to customize colors, spacing, and other styles.

## Pages

The main dashboard page (`src/app/page.tsx`) includes:
- Welcome header
- Stats cards (Users, Revenue, Projects, Tasks)
- Recent activity feed

You can create additional pages in the `src/app` directory, and they will automatically use this layout.
