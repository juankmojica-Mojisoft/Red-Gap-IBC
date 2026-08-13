import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

export const ActionCard: React.FC<ActionCardProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  onClick,
  color = 'primary'
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
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl border-2 text-left w-full group',
        'transition-all duration-200 hover:shadow-md hover:border-transparent'
      )}
      style={{ 
        borderColor: `${selectedColor}30`,
        ['--hover-bg' as string]: `${selectedColor}10`
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = `${selectedColor}10`;
        e.currentTarget.style.borderColor = selectedColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.borderColor = `${selectedColor}30`;
      }}
    >
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
        style={{ backgroundColor: `${selectedColor}15` }}
      >
        <Icon className="w-6 h-6" style={{ color: selectedColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-500 truncate">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all shrink-0" />
    </button>
  );
};

export default ActionCard;
