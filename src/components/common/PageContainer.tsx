import React from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const PageContainer: React.FC<PageContainerProps> = ({ 
  children, 
  className,
  maxWidth = 'xl'
}) => {
  const maxWidthClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-5xl',
    xl: 'max-w-6xl',
    full: 'max-w-full'
  };

  return (
    <div className={cn(
      'mx-auto p-4 sm:p-6 animate-fade-in pb-24 lg:pb-6',
      maxWidthClasses[maxWidth],
      className
    )}>
      {children}
    </div>
  );
};

export default PageContainer;
