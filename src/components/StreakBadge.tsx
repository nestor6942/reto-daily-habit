import { Flame } from "lucide-react";

interface Props {
  count: number;
}

export function StreakBadge({ count }: Props) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-streak/15 px-4 py-2">
      <Flame className="w-5 h-5 text-streak" />
      <span className="font-bold text-streak text-lg">{count}</span>
      <span className="text-sm text-muted-foreground">
        {count === 1 ? "día" : "días"} seguidos
      </span>
    </div>
  );
}
