import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Package, 
  Warehouse, 
  TrendingUp, 
  Users, 
  FileText, 
  Settings,
  BarChart3,
  ShoppingCart,
  Wine,
  Truck
} from 'lucide-react';

interface SideNavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: SideNavItem[] = [
  {
    title: 'Produits',
    href: '/dashboard/products',
    icon: Wine,
  },
  {
    title: 'Stock',
    href: '/dashboard/stock',
    icon: Warehouse,
  },
  {
    title: 'Commandes',
    href: '/dashboard/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Fournisseurs',
    href: '/dashboard/suppliers',
    icon: Truck,
  },
  {
    title: 'Clients',
    href: '/dashboard/customers',
    icon: Users,
  },
  {
    title: 'Analytique',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    title: 'Ventes',
    href: '/dashboard/sales',
    icon: TrendingUp,
  },
  {
    title: 'Rapports',
    href: '/dashboard/reports',
    icon: FileText,
  },
  {
    title: 'Inventaire',
    href: '/dashboard/inventory',
    icon: Package,
  },
  {
    title: 'Paramètres',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function SideNav() {
  const location = useLocation();

  return (
    <aside className="w-64 min-h-screen border-r border-border" style={{ backgroundColor: 'hsl(var(--sidebar))' }}>
      <nav className="flex flex-col h-full">
        <div className="p-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-[hsl(var(--sidebar-accent))]',
                  isActive
                    ? 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))]'
                    : 'text-[hsl(var(--sidebar-foreground))] opacity-80 hover:opacity-100'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
