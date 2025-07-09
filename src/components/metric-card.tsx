import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  status: 'success' | 'warning' | 'danger' | 'neutral';
  icon: ReactNode;
}

export function MetricCard({ title, value, description, status, icon }: MetricCardProps) {
  
  const statusColorClass = {
    success: 'text-risk-low',
    warning: 'text-risk-medium',
    danger: 'text-risk-high',
    neutral: 'text-muted-foreground',
  }[status];

  return (
    <Card className="h-full shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn("h-5 w-5", statusColorClass)}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
