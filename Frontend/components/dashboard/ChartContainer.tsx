import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function ChartContainer({ title, description, children }: ChartContainerProps) {
  return (
    <Card className="border border-border/50 shadow-xl bg-card/40 backdrop-blur-xl rounded-3xl overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold tracking-tight text-foreground/80">{title}</CardTitle>
        {description && <CardDescription className="text-sm text-muted-foreground/60">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pl-2 pt-4">
        {children}
      </CardContent>
    </Card>
  );
}
