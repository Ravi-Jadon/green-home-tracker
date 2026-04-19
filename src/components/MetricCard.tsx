import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  accent?: "primary" | "leaf" | "solar" | "earth";
}

const accentMap = {
  primary: "from-primary to-primary-glow",
  leaf: "from-leaf to-primary",
  solar: "from-solar to-accent",
  earth: "from-earth to-leaf",
};

export function MetricCard({ label, value, hint, icon: Icon, accent = "primary" }: MetricCardProps) {
  return (
    <Card className="relative overflow-hidden gradient-card border-border/60 shadow-soft hover:shadow-elegant transition-smooth group">
      <div className={cn("absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br opacity-10 blur-2xl group-hover:opacity-20 transition-smooth", accentMap[accent])} />
      <div className="p-5 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="font-display text-3xl font-bold leading-tight">{value}</p>
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
          </div>
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-primary-foreground shadow-soft", accentMap[accent])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>
    </Card>
  );
}
