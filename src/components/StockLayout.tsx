import { DashboardLayout } from '@/components/DashboardLayout';

interface StockLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function StockLayout({ children, title, description }: StockLayoutProps) {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Page Content */}
        {children}
      </div>
    </DashboardLayout>
  );
}
