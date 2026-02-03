import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatsCard({ icon: Icon, label, value, subtitle, trend }: StatsCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        {trend && (
          <span className={`text-xs font-medium ${
            trend === 'up' ? 'text-success' : 
            trend === 'down' ? 'text-destructive' : 
            'text-muted-foreground'
          }`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '–'}
          </span>
        )}
      </div>
      <div>
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}