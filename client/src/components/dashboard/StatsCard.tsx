import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  subtitle?: string;
  trend?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  subtitle,
  trend,
}: StatsCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && <p className="text-xs text-green-500 mt-1">{trend}</p>}
        </div>
        <div className="text-primary">{icon}</div>
      </div>
    </Card>
  );
}
