import type { Challenge } from "@/types/challenge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Check, Trash2 } from "lucide-react";

interface Props {
  challenge: Challenge;
  onIncrement: () => void;
  onRemove: () => void;
}

export function ChallengeCard({ challenge, onIncrement, onRemove }: Props) {
  const { name, currentValue, targetValue } = challenge;
  const percent = Math.min(100, Math.round((currentValue / targetValue) * 100));
  const done = currentValue >= targetValue;

  return (
    <div className={`rounded-2xl border p-4 transition-colors ${done ? "border-success bg-success/10" : "bg-card border-border"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-card-foreground truncate text-lg">{name}</h3>
          <p className="text-sm text-muted-foreground">
            {currentValue} / {targetValue}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-3">
          {done ? (
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-success">
              <Check className="w-7 h-7 text-success-foreground" />
            </div>
          ) : (
            <Button
              size="icon"
              onClick={onIncrement}
              className="w-14 h-14 rounded-full text-2xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="w-7 h-7" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={onRemove}
            className="w-10 h-10 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <Progress value={percent} className="h-3" />
      <p className="text-right text-xs text-muted-foreground mt-1">{percent}%</p>
    </div>
  );
}
