import { ReactNode } from 'react';
import { Hexagon } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthLayout({ children, title = 'Welcome to Dayflow', subtitle = 'Sign in to continue' }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-[420px] flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-2">
            <Hexagon className="h-8 w-8 text-primary fill-primary/20" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        
        <div className="w-full bg-card rounded-xl border shadow-sm p-6 sm:p-8">
          {children}
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          &copy; {new Date().getFullYear()} Dayflow HR Management System
        </p>
      </div>
    </div>
  );
}
