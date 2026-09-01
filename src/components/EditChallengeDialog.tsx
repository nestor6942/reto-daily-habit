import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Challenge, HabitCategory } from "@/types/challenge";

const CATEGORIES: { key: HabitCategory; label: string; emoji: string }[] = [
  { key: "fuerza", label: "Fuerza", emoji: "💪" },
  { key: "cardio", label: "Cardio", emoji: "🏃" },
  { key: "flexibilidad", label: "Flex", emoji: "🧘" },
  { key: "mente", label: "Mente", emoji: "🧠" },
  { key: "nutricion", label: "Nutrición", emoji: "🥗" },
  { key: "general", label: "General", emoji: "🎯" },
];

const UNITS = ["reps", "min", "seg", "km", "vasos", "páginas", "veces"];

interface Props {
  challenge: Challenge | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    id: string,
    data: {
      name: string;
      targetValue: number;
      unit: string;
      category: HabitCategory;
    }
  ) => void;
}

export function EditChallengeDialog({
  challenge,
  open,
  onOpenChange,
  onSave,
}: Props) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("reps");
  const [category, setCategory] = useState<HabitCategory>("general");

  useEffect(() => {
    if (challenge) {
      setName(challenge.name);
      setTarget(String(challenge.targetValue));
      setUnit(challenge.unit || "reps");
      setCategory(challenge.category || "general");
    }
  }, [challenge]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge) return;
    const t = parseInt(target, 10);
    if (name.trim() && t > 0) {
      onSave(challenge.id, {
        name: name.trim(),
        targetValue: t,
        unit,
        category,
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Editar Reto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">Nombre del reto</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Flexiones"
              className="h-11"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-target">Meta diaria</Label>
              <Input
                id="edit-target"
                type="number"
                min={1}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="h-11"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Unidad</Label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Categoría</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategory(cat.key)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all border ${
                    category === cat.key
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
