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
    borrow: "text-blue-600 bg-blue-100",
    return: "text-green-600 bg-green-100",
    reservation: "text-purple-600 bg-purple-100",
    member: "text-orange-600 bg-orange-100",
  };

  return (
    <div className="flex items-start gap-4">
      <div className={`rounded-full p-2 ${typeColors[type]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground">{timestamp}</p>
      </div>
    </div>
  );
}
