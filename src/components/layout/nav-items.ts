import { LayoutDashboard, PieChart, ReceiptText, Tag, Users, WalletCards, type LucideIcon } from 'lucide-react';

export type NavItem = { href: string; label: string; icon: LucideIcon };

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/spending', label: 'Spending', icon: WalletCards },
  { href: '/bills', label: 'Bills', icon: ReceiptText },
  { href: '/budget', label: 'Budget', icon: PieChart },
  { href: '/settings/family', label: 'Family', icon: Users },
  { href: '/settings/categories', label: 'Categories', icon: Tag },
];
