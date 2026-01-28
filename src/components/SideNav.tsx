import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useStockStore } from '@/store/stock.store';
import {
  Warehouse,
  TrendingUp,
  Users,
  FileText,
  Settings,
  BarChart3,
  Wine,
  Truck,
  CreditCard,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Package,
  ScanBarcode,
  ClipboardList,
  ShoppingCart,
  PackagePlus,
  ListCheck,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeVariant?: 'default' | 'destructive';
}

interface NavGroup {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  basePath: string;
  children: NavItem[];
}

type NavEntry = NavItem | NavGroup;

function isNavGroup(entry: NavEntry): entry is NavGroup {
  return 'children' in entry;
}

export function SideNav() {
  const location = useLocation();
  const { alertesCount } = useStockStore();
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(['gestion-stock']));

  const navEntries: NavEntry[] = [
    {
      title: 'Caisse',
      href: '/dashboard/pos',
      icon: CreditCard,
    },
    {
      title: 'Produits',
      href: '/dashboard/products',
      icon: Wine,
    },
    {
      id: 'gestion-stock',
      title: 'Gestion Stock',
      icon: Warehouse,
      basePath: '/dashboard/gestion-stock',
      children: [
        {
          title: 'État du stock',
          href: '/dashboard/gestion-stock',
          icon: ListCheck,
        },
        // {
        //   title: 'Alertes',
        //   href: '/dashboard/gestion-stock/alertes',
        //   icon: AlertTriangle,
        //   badge: alertesCount > 0 ? alertesCount : undefined,
        //   badgeVariant: 'destructive',
        // },
        {
          title: 'Mouvements',
          href: '/dashboard/gestion-stock/mouvements',
          icon: Package,
        },
        {
          title: 'Scanner',
          href: '/dashboard/gestion-stock/scanner',
          icon: ScanBarcode,
        },
        {
          title: 'Inventaires',
          href: '/dashboard/gestion-stock/inventaires',
          icon: ClipboardList,
        },
        {
          title: 'Commandes',
          href: '/dashboard/gestion-stock/commandes',
          icon: ShoppingCart,
        },
        {
          title: 'Réception',
          href: '/dashboard/gestion-stock/reception',
          icon: PackagePlus,
        },
      ],
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
      title: 'Paramètres',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ];

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const isItemActive = (href: string) => {
    return location.pathname === href;
  };

  const isGroupActive = (group: NavGroup) => {
    return location.pathname.startsWith(group.basePath);
  };

  return (
    <aside className="w-64 min-h-screen border-r border-border" style={{ backgroundColor: 'hsl(var(--sidebar))' }}>
      <nav className="flex flex-col h-full">
        <div className="p-6 space-y-1">
          {navEntries.map((entry) => {
            if (isNavGroup(entry)) {
              const GroupIcon = entry.icon;
              const isOpen = openGroups.has(entry.id);
              const groupActive = isGroupActive(entry);

              return (
                <div key={entry.id} className="space-y-1">
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(entry.id)}
                    className={cn(
                      'w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-[hsl(var(--sidebar-accent))]',
                      groupActive
                        ? 'text-[hsl(var(--sidebar-foreground))]'
                        : 'text-[hsl(var(--sidebar-foreground))] opacity-80 hover:opacity-100'
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <GroupIcon className="h-5 w-5" />
                      {entry.title}
                    </span>
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  {/* Group Children */}
                  <div
                    className={cn(
                      'overflow-hidden transition-all duration-200',
                      isOpen ? 'max-h-[500px]' : 'max-h-0'
                    )}
                  >
                    <div className="pl-4 space-y-1">
                      {entry.children.map((child) => {
                        const ChildIcon = child.icon;
                        const isActive = isItemActive(child.href);

                        return (
                          <Link
                            key={child.href}
                            to={child.href}
                            className={cn(
                              'flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all hover:bg-[hsl(var(--sidebar-accent))]',
                              isActive
                                ? 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))] font-medium'
                                : 'text-[hsl(var(--sidebar-foreground))] opacity-70 hover:opacity-100'
                            )}
                          >
                            <span className="flex items-center gap-3">
                              <ChildIcon className="h-4 w-4" />
                              {child.title}
                            </span>
                            {child.badge !== undefined && (
                              <span
                                className={cn(
                                  'px-2 py-0.5 text-xs rounded-full font-medium',
                                  child.badgeVariant === 'destructive'
                                    ? 'bg-destructive/20 text-destructive'
                                    : 'bg-primary/20 text-primary'
                                )}
                              >
                                {child.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            // Simple NavItem
            const Icon = entry.icon;
            const isActive = location.pathname === entry.href || location.pathname.startsWith(entry.href + '/');

            return (
              <Link
                key={entry.href}
                to={entry.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-[hsl(var(--sidebar-accent))]',
                  isActive
                    ? 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))]'
                    : 'text-[hsl(var(--sidebar-foreground))] opacity-80 hover:opacity-100'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{entry.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
