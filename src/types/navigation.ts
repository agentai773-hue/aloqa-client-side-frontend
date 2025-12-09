import { ReactNode } from 'react';

export interface NavChild {
  id: string;
  name: string;
  href: string;
  icon?: ReactNode;
  isActive?: boolean;
}

export interface NavSection {
  id: string;
  name: string;
  icon: ReactNode;
  href?: string;
  isExpandable: boolean;
  isExpanded?: boolean;
  isActive?: boolean;
  children?: NavChild[];
}