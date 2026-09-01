import { ShoppingBag, ExternalLink, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface GearItem {
  name: string;
  category: string;
  price: string;
  emoji: string;
  description: string;
  url: string;
}

const GEAR_ITEMS: GearItem[] = [
  {
    name: "Bandas Elásticas de Resistencia",
    category: "Fuerza en casa",
    price: "$14.99",
    emoji: "💪",
    description: "Set de 5 niveles para entrenar pecho, piernas y glúteos en cualquier lugar.",
    url: "https://amazon.com/dp/B07C2V4V6Z?tag=retodiario-20",
  },
  {
    name: "Botella Motivacional con Horas (2L)",
    category: "Hidratación",
    price: "$12.99",
    emoji: "💧",
    description: "Marcadores de tiempo para asegurar tus 2 litros de agua diarios sin esfuerzo.",
    url: "https://amazon.com/dp/B08CXS24N2?tag=retodiario-20",
  },
  {
    name: "Tapete Antideslizante para Yoga/Planchas",
    category: "Flexibilidad & Core",
    price: "$19.99",
    emoji: "🧘",
    description: "Amortiguación de alta densidad para proteger rodillas y codos en flexiones.",
    url: "https://amazon.com/dp/B07H2DN44V?tag=retodiario-20",
  },
];

export function RecommendedGear() {
  return (
    <div className="rounded-2xl border bg-card p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-xs sm:text-sm text-foreground">
            Equipamiento Recomendado
          </h3>
        </div>
        <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
          <Sparkles className="w-3 h-3 text-amber-500" /> Selección de calidad
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {GEAR_ITEMS.map((item) => (
          <motion.a
            key={item.name}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -1 }}
            className="flex items-center justify-between p-3 rounded-xl border bg-muted/40 hover:bg-muted/70 hover:border-primary/40 transition-all text-left group"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="text-2xl shrink-0">{item.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-xs text-foreground truncate group-hover:text-primary transition-colors">
                    {item.name}
                  </h4>
                  <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                    {item.price}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                  {item.description}
                </p>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary shrink-0 ml-2" />
          </motion.a>
        ))}
      </div>
    </div>
  );
}
