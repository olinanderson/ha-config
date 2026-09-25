import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface PageContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  /** For a page whose top has to fit one phone screen (the Van page while
   *  driving): below the `sm` breakpoint the heading goes and the cards sit
   *  closer together. */
  compactOnPhone?: boolean;
}

export function PageContainer({ title, subtitle, children, className, compactOnPhone }: PageContainerProps) {
  // The heading keeps its own bottom margin rather than being spaced by the
  // children's space-y, so hiding it on a phone takes its gap with it.
  return (
    <div className={cn('p-4 md:p-6 max-w-screen-2xl mx-auto', className)}>
      <div className={cn('mb-4 flex items-baseline gap-3', compactOnPhone && 'max-sm:hidden')}>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
      </div>
      <div className={cn('space-y-4', compactOnPhone && 'max-sm:space-y-3')}>{children}</div>
    </div>
  );
}
