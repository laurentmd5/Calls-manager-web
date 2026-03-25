import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { AppSidebar } from './AppSidebar';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export const DashboardLayout = ({ children, title, subtitle }: DashboardLayoutProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { mobileOpen, setMobileOpen, collapsed } = useSidebar();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 border-b border-slate-200 bg-white px-4 flex items-center justify-between">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <AppSidebar />
          </SheetContent>
        </Sheet>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        <div className="w-10" />
      </header>

      {/* Main Content */}
      <main className={cn(
        'min-h-screen pt-14 lg:pt-0 transition-all duration-300',
        collapsed ? 'lg:ml-16' : 'lg:ml-64'
      )}>
        <div className="p-4 md:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-slate-500 text-sm">{subtitle}</p>
            )}
          </div>

          {/* Page Content */}
          {children}
        </div>
      </main>
    </div>
  );
};
