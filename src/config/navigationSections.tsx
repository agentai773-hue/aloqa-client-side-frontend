import React from 'react';
import {
  Home,
  Users,
  Briefcase,
  BarChart,
  Settings,
  UserPlus,
  List,
} from 'lucide-react';

export interface NavSection {
  id: string;
  name: string;
  icon: React.ReactElement;
  isExpandable: boolean;
  isExpanded?: boolean;
  href?: string;
  children?: {
    name: string;
    href: string;
    icon: React.ReactElement;
  }[];
}

export const navigationSections: NavSection[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: <Home className="h-5 w-5" />,
    isExpandable: false,
    href: '/dashboard',
  },
  {
    id: 'leads',
    name: 'Lead Management',
    icon: <Users className="h-5 w-5" />,
    isExpandable: true,
    isExpanded: false,
    children: [
      {
        name: 'All Leads',
        href: '/dashboard/leads',
        icon: <List className="h-4 w-4" />,
      },
      {
        name: 'Add Lead',
        href: '/dashboard/leads/add',
        icon: <UserPlus className="h-4 w-4" />,
      },
    ],
  },
  {
    id: 'projects',
    name: 'Projects',
    icon: <Briefcase className="h-5 w-5" />,
    isExpandable: false,
    href: '/dashboard/projects',
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: <BarChart className="h-5 w-5" />,
    isExpandable: false,
    href: '/dashboard/analytics',
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: <Settings className="h-5 w-5" />,
    isExpandable: false,
    href: '/dashboard/settings',
  },
];
