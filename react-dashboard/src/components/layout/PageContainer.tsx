import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface PageContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function PageContainer({ title, subtitle, children, className }: PageContainerProps) {
  return (
    <div className={cn('p-4 md:p-6 space-y-4 max-w-screen-2xl mx-auto', className)}>
      <div className="flex items-baseline gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}
