import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon  } from "lucide-react";
import { useState } from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    loading?: boolean;
  };
}


export function DashboardCard({ title, value, description, icon: Icon, trend }: DashboardCardProps) {
  return (
    
    <Card className="relative overflow-hidden group border border-border/50 shadow-lg hover:shadow-2xl transition-all duration-500 bg-card/40 backdrop-blur-xl rounded-3xl">
      {/* Subtle background decoration instead of overlapping icon */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-xs font-bold text-muted-foreground/70 uppercase tracking-[0.2em]">{title}</CardTitle>
        <div className="p-2.5 bg-primary/10 rounded-2xl group-hover:scale-110 transition-transform duration-500">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-4xl font-extrabold tracking-tighter text-foreground/90">{value}</div>
        {description && (
          <p className="text-sm text-muted-foreground/60 mt-1.5 font-medium">{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-2 mt-5">
            <span className={`flex items-center justify-center w-6 h-6 rounded-full ${trend.isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
              <span className="text-xs">{trend.isPositive ? '↑' : '↓'}</span>
            </span>
            <span className={`text-sm font-bold ${trend.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
              {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-muted-foreground/50 font-medium">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
