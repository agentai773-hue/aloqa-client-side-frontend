# Component Structure Documentation

## 📁 Folder Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with Sidebar & Header
│   ├── page.tsx            # Dashboard page
│   └── globals.css
└── components/
    ├── layout/             # Layout components
    │   ├── Sidebar.tsx     # Main navigation sidebar
    │   ├── Header.tsx      # Top header with search & profile
    │   └── index.ts        # Layout exports
    └── ui/                 # Reusable UI components
        ├── loader.tsx      # Loading spinner components
        ├── button.tsx      # Button component
        ├── card.tsx        # Card components
        ├── input.tsx       # Input field component
        └── index.ts        # UI exports
```

## 🎨 Components Overview

### Layout Components (`src/components/layout/`)

#### **Sidebar.tsx**
Main navigation sidebar with:
- ✅ Lucide React icons (Home, Users, FileText, BarChart3, Settings)
- ✅ Fixed position on desktop
- ✅ Collapsible on mobile with overlay
- ✅ Smooth transitions and hover effects
- ✅ User profile section at bottom
- ✅ Mobile hamburger menu toggle

**Navigation Items:**
- Dashboard (Home icon)
- Users (Users icon)
- Documents (FileText icon)
- Analytics (BarChart3 icon)
- Settings (Settings icon)

#### **Header.tsx**
Top header component with:
- ✅ Search bar with Search icon
- ✅ Notification bell with badge indicator
- ✅ User profile button with avatar
- ✅ Fully responsive layout
- ✅ Sticky positioning

### UI Components (`src/components/ui/`)

#### **loader.tsx**
Loading spinner components:
- `Loader` - Basic loader with customizable size
- `FullPageLoader` - Full-screen loading overlay
- `InlineLoader` - Inline loading indicator

```tsx
import { Loader, FullPageLoader, InlineLoader } from "@/components/ui";

// Usage
<Loader size={24} text="Loading..." />
<FullPageLoader text="Please wait..." />
<InlineLoader text="Loading data..." />
```

#### **button.tsx**
Customizable button component:
- **Variants:** primary, secondary, outline, ghost, danger
- **Sizes:** sm, md, lg
- Full TypeScript support

```tsx
import { Button } from "@/components/ui";

// Usage
<Button variant="primary" size="md">Click me</Button>
<Button variant="danger" size="sm">Delete</Button>
```

#### **card.tsx**
Card components for layouts:
- `Card` - Main card container
- `CardHeader` - Card header section
- `CardBody` - Card content section
- `CardFooter` - Card footer section

```tsx
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui";

// Usage
<Card>
  <CardHeader>Title</CardHeader>
  <CardBody>Content here</CardBody>
  <CardFooter>Footer actions</CardFooter>
</Card>
```

#### **input.tsx**
Form input component:
- Label support
- Error message display
- Full TypeScript support

```tsx
import { Input } from "@/components/ui";

// Usage
<Input 
  label="Email" 
  type="email" 
  placeholder="Enter email"
  error="Invalid email"
/>
```

## 🎯 Icons

**Using Lucide React Icons**

All icons are from the `lucide-react` library:

```tsx
import { Home, Users, Settings, Search, Bell } from "lucide-react";

<Home className="w-6 h-6 text-blue-600" />
<Users className="w-5 h-5" />
```

**Common Icons Used:**
- Navigation: `Home`, `Users`, `FileText`, `BarChart3`, `Settings`
- UI: `Search`, `Bell`, `User`, `Menu`, `X`
- Dashboard: `DollarSign`, `FolderKanban`, `CheckCircle2`, `UserPlus`, `Package`, `CreditCard`, `FileEdit`
- Loading: `Loader2`

## 🚀 Usage Examples

### Adding a New Page

Create a new page that uses the layout:

```tsx
// src/app/users/page.tsx
import { Users } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-600 mt-2">Manage your users</p>
      </div>
      
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">User List</h2>
        </CardHeader>
        <CardBody>
          {/* Your content here */}
        </CardBody>
      </Card>
    </div>
  );
}
```

### Adding Navigation Items

Edit `src/components/layout/Sidebar.tsx`:

```tsx
import { YourIcon } from "lucide-react";

const navigation = [
  // ... existing items
  { name: "Your Page", href: "/your-page", icon: YourIcon },
];
```

### Using the Loader

```tsx
"use client";

import { useState, useEffect } from "react";
import { InlineLoader } from "@/components/ui";

export default function MyComponent() {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 2000);
  }, []);
  
  if (loading) return <InlineLoader text="Loading data..." />;
  
  return <div>Your content</div>;
}
```

## 🎨 Styling

All components use **Tailwind CSS** for styling:
- Consistent color scheme (gray-900 for dark, blue-600 for primary)
- Responsive design with mobile-first approach
- Smooth transitions and hover effects
- Proper spacing and typography

### Color Palette

```
Primary: blue-600
Success: green-600
Warning: orange-600
Danger: red-600
Purple: purple-600
Background: gray-50
Text: gray-900
Muted: gray-600
Border: gray-200
```

## 📱 Responsive Design

- **Desktop (lg+):** Fixed sidebar, full header
- **Tablet (md):** Fixed sidebar, compact header
- **Mobile (<lg):** Collapsible sidebar with overlay, mobile-optimized header

## 🔧 Customization

### Changing Theme Colors

Edit component files and update Tailwind classes:

```tsx
// Change primary color from blue to purple
className="bg-blue-600" → className="bg-purple-600"
className="text-blue-600" → className="text-purple-600"
```

### Adding Dark Mode

The components are ready for dark mode. Add dark mode classes:

```tsx
className="bg-white dark:bg-gray-800"
className="text-gray-900 dark:text-white"
```

## 📦 Dependencies

- **lucide-react** - Icon library
- **Next.js** - React framework
- **Tailwind CSS** - Utility-first CSS

## ✨ Features

✅ Modern folder structure with separation of concerns
✅ Reusable UI components library
✅ Professional loading states
✅ Lucide React icons throughout
✅ Fully responsive design
✅ TypeScript support
✅ Clean and maintainable code
✅ Easy to extend and customize
