import { LucideIcon } from "lucide-react";

interface ActivityItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
  timestamp: string;
  type?: "borrow" | "return" | "reservation" | "member";
}

export function ActivityItem({ icon: Icon, title, description, timestamp, type = "borrow" }: ActivityItemProps) {
  const typeColors = {
    borrow: "text-blue-500 bg-blue-500/10 ring-1 ring-blue-500/20",
    return: "text-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/20",
    reservation: "text-violet-500 bg-violet-500/10 ring-1 ring-violet-500/20",
    member: "text-amber-500 bg-amber-500/10 ring-1 ring-amber-500/20",
  };

  return (
    <div className="flex items-start gap-4">
      <div className={`rounded-2xl p-2.5 shadow-sm transition-transform duration-300 group-hover:scale-110 ${typeColors[type]}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="flex-1 space-y-1.5">
        <p className="text-sm font-bold text-foreground/80 leading-none">{title}</p>
        <p className="text-sm text-muted-foreground/70 leading-relaxed">{description}</p>
        <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{timestamp}</p>
      </div>
    </div>
  );
}
