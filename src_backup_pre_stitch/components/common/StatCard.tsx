import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  onClick?: () => void;
  trend?: {
    value: number;
    positive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  color = 'primary',
  onClick,
  trend
}) => {
  const { tema } = useAuth();

  const colorMap = {
    primary: tema.primario,
    success: tema.exito,
    warning: tema.advertencia,
    error: tema.error,
    info: tema.info
  };

  const selectedColor = colorMap[color];

  return (
    <Card 
      className={cn(
        'border-l-4 transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-lg'
      )}
      style={{ borderLeftColor: selectedColor }}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500 font-medium truncate">{title}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl sm:text-3xl font-bold">{value}</h3>
              {trend && (
                <span className={cn(
                  'text-xs font-medium',
                  trend.positive ? 'text-green-600' : 'text-red-600'
                )}>
                  {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-gray-400 mt-1">{description}</p>
            )}
          </div>
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ml-3"
            style={{ backgroundColor: `${selectedColor}15` }}
          >
            <Icon className="w-6 h-6" style={{ color: selectedColor }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
