import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Warehouse,
  AlertTriangle,
  Package,
  ScanBarcode,
  PackagePlus,
  ClipboardList,
  ShoppingCart,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  id: string;
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
  items: NavItem[];
  defaultOpen?: boolean;
}

interface StockSideNavProps {
  alertesCount?: number;
}

export function StockSideNav({ alertesCount = 0 }: StockSideNavProps) {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(['stock', 'approvisionnement']));

  const navGroups: NavGroup[] = [
    {
      id: 'stock',
      title: 'Stock',
      icon: Warehouse,
      defaultOpen: true,
      items: [
        {
          id: 'etat',
          title: 'État du stock',
          href: '/dashboard/gestion-stock',
          icon: Warehouse,
        },
        {
          id: 'alertes',
          title: 'Alertes',
          href: '/dashboard/gestion-stock/alertes',
          icon: AlertTriangle,
          badge: alertesCount > 0 ? alertesCount : undefined,
          badgeVariant: 'destructive',
        },
        {
          id: 'mouvements',
          title: 'Mouvements',
          href: '/dashboard/gestion-stock/mouvements',
          icon: Package,
        },
        {
          id: 'scanner',
          title: 'Scanner',
          href: '/dashboard/gestion-stock/scanner',
          icon: ScanBarcode,
        },
      ],
    },
    {
      id: 'inventaire',
      title: 'Inventaire',
      icon: ClipboardList,
      items: [
        {
          id: 'inventaires',
          title: 'Liste des inventaires',
          href: '/dashboard/gestion-stock/inventaires',
          icon: ClipboardList,
        },
      ],
    },
    {
      id: 'approvisionnement',
      title: 'Approvisionnement',
      icon: ShoppingCart,
      defaultOpen: true,
      items: [
        {
          id: 'commandes',
          title: 'Commandes fournisseur',
          href: '/dashboard/gestion-stock/commandes',
          icon: ShoppingCart,
        },
        {
          id: 'reception',
          title: 'Réception',
          href: '/dashboard/gestion-stock/reception',
          icon: PackagePlus,
        },
      ],
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
    return group.items.some((item) => location.pathname === item.href);
  };

  return (
    <aside className="w-56 min-h-full border-r border-border bg-card/50 flex-shrink-0">
      <nav className="p-4 space-y-2">
        {navGroups.map((group) => {
          const isOpen = openGroups.has(group.id);
          const GroupIcon = group.icon;
          const groupActive = isGroupActive(group);

          return (
            <div key={group.id} className="space-y-1">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.id)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  groupActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <span className="flex items-center gap-2">
                  <GroupIcon className="h-4 w-4" />
                  {group.title}
                </span>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {/* Group Items */}
              <div
                className={cn(
                  'overflow-hidden transition-all duration-200',
                  isOpen ? 'max-h-96' : 'max-h-0'
                )}
              >
                <div className="pl-4 space-y-1">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive = isItemActive(item.href);

                    return (
                      <Link
                        key={item.id}
                        to={item.href}
                        className={cn(
                          'flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors',
                          isActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <ItemIcon className="h-4 w-4" />
                          {item.title}
                        </span>
                        {item.badge !== undefined && (
                          <span
                            className={cn(
                              'px-2 py-0.5 text-xs rounded-full font-medium',
                              item.badgeVariant === 'destructive'
                                ? 'bg-destructive/10 text-destructive'
                                : 'bg-primary/10 text-primary'
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
