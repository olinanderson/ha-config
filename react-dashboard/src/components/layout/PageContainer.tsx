import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface PageContainerProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function PageContainer({ title, children, className }: PageContainerProps) {
  return (
    <div className={cn('p-4 md:p-6 space-y-4 max-w-screen-2xl mx-auto', className)}>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {children}
    </div>
  );
}
