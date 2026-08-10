import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight } from 'lucide-react';

interface SectionCardProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({ 
  title, 
  icon: Icon, 
  children,
  action,
  className
}) => {
  const { tema } = useAuth();

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Icon className="w-5 h-5" style={{ color: tema.primario }} />
          {title}
        </CardTitle>
        {action && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={action.onClick}
            className="text-sm"
          >
            {action.label}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export default SectionCard;
