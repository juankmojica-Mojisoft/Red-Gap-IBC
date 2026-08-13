import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: Icon, 
  title, 
  description,
  action,
  className
}) => {
  const { tema } = useAuth();

  return (
    <div className={cn(
      'text-center py-12 px-4 bg-gray-50 rounded-xl',
      className
    )}>
      <div 
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: `${tema.primario}15` }}
      >
        <Icon className="w-8 h-8" style={{ color: tema.primario }} />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 mb-4 max-w-md mx-auto">{description}</p>
      )}
      {action && (
        <Button 
          onClick={action.onClick}
          style={{ backgroundColor: tema.primario }}
          className="text-white"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
