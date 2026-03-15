import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onAdd: (name: string, target: number) => void;
}

export function AddChallengeForm({ onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = parseInt(target, 10);
    if (name.trim() && t > 0) {
      onAdd(name.trim(), t);
      setName("");
      setTarget("");
      setOpen(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {!open ? (
        <motion.div
          key="button"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            onClick={() => setOpen(true)}
            variant="outline"
            className="w-full h-14 border-dashed border-2 text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Añadir reto
          </Button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={handleSubmit}
          className="rounded-2xl border bg-card p-4 space-y-3"
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <Input
            placeholder="Nombre del reto (ej: Flexiones)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="h-12 text-base"
          />
          <Input
            type="number"
            placeholder="Meta (ej: 30)"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            min={1}
            className="h-12 text-base"
          />
          <div className="flex gap-2">
            <Button type="submit" className="flex-1 h-12 bg-primary text-primary-foreground">
              Guardar
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="h-12"
            >
              Cancelar
            </Button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
