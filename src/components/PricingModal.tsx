import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Crown,
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { subscriptionManager, type SubscriptionTier } from "@/lib/subscription";
import { soundManager } from "@/lib/soundEffects";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubscriptionChange?: () => void;
}

export function PricingModal({
  open,
  onOpenChange,
  onSubscriptionChange,
}: Props) {
  const [selectedPlan, setSelectedPlan] = useState<"annual" | "monthly" | "lifetime">("annual");
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  const checkoutUrls = subscriptionManager.getCheckoutUrls();

  const handleCheckout = () => {
    soundManager.playPop();
    const url =
      selectedPlan === "annual"
        ? checkoutUrls.annual
        : selectedPlan === "monthly"
        ? checkoutUrls.monthly
        : checkoutUrls.lifetime;

    // For demonstration & testing, if URL contains "test_", simulate instant PRO activation
    if (url.includes("test_")) {
      subscriptionManager.setTier(selectedPlan === "lifetime" ? "lifetime" : "pro");
      soundManager.playAchievement();
      toast.success("¡Plan PRO activado con éxito! Bienvenido al nivel Titán.");
      if (onSubscriptionChange) onSubscriptionChange();
      onOpenChange(false);
      return;
    }

    window.open(url, "_blank");
  };

  const handleRedeemCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setPromoLoading(true);
    const res = subscriptionManager.redeemPromoCode(promoCode);
    setPromoLoading(false);

    if (res.success) {
      soundManager.playAchievement();
      toast.success(res.message);
      setPromoCode("");
      if (onSubscriptionChange) onSubscriptionChange();
      onOpenChange(false);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-3xl p-5 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-streak/20 flex items-center justify-center text-amber-500 mb-2 border border-amber-500/30">
            <Crown className="w-8 h-8" />
          </div>
          <DialogTitle className="text-2xl font-black text-foreground">
            Desbloquea Reto Diario PRO
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Supera tus límites con hábitos ilimitados, programas guiados y asistencia de IA sin restricciones.
          </p>
        </DialogHeader>

        {/* Plan Selector Grid */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          {/* Monthly */}
          <button
            type="button"
            onClick={() => setSelectedPlan("monthly")}
            className={`p-3 rounded-2xl border text-center transition-all relative ${
              selectedPlan === "monthly"
                ? "border-primary bg-primary/10 shadow-sm"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <span className="text-[11px] font-semibold text-muted-foreground block">
              Mensual
            </span>
            <p className="text-lg font-black text-foreground mt-1">$3.99</p>
            <span className="text-[10px] text-muted-foreground">/mes</span>
          </button>

          {/* Annual (Best value) */}
          <button
            type="button"
            onClick={() => setSelectedPlan("annual")}
            className={`p-3 rounded-2xl border text-center transition-all relative ${
              selectedPlan === "annual"
                ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-primary text-primary-foreground shadow-sm whitespace-nowrap">
              Ahorra 37%
            </span>
            <span className="text-[11px] font-semibold text-primary block mt-1">
              Anual
            </span>
            <p className="text-lg font-black text-foreground mt-0.5">$2.49</p>
            <span className="text-[10px] text-muted-foreground">/mes ($29.99/año)</span>
          </button>

          {/* Lifetime */}
          <button
            type="button"
            onClick={() => setSelectedPlan("lifetime")}
            className={`p-3 rounded-2xl border text-center transition-all relative ${
              selectedPlan === "lifetime"
                ? "border-amber-500 bg-amber-500/10 shadow-sm ring-1 ring-amber-500"
                : "border-border bg-card hover:border-amber-500/40"
            }`}
          >
            <span className="text-[11px] font-semibold text-amber-500 block">
              De por Vida
            </span>
            <p className="text-lg font-black text-foreground mt-1">$49.99</p>
            <span className="text-[10px] text-muted-foreground">Pago único</span>
          </button>
        </div>

        {/* Benefits Checklist */}
        <div className="rounded-2xl bg-muted/60 p-4 space-y-2.5 my-2 text-xs">
          <h4 className="font-bold text-foreground flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Beneficios incluidos en tu membresía PRO:
          </h4>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-success/20 text-success flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span><strong className="text-foreground">Hábitos y Retos Ilimitados</strong> (sin restricción de 3).</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-success/20 text-success flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span><strong className="text-foreground">Programas Guiados de 21 y 30 Días</strong> listos para usar.</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-success/20 text-success flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span><strong className="text-foreground">Asistente de IA Ilimitado</strong> con rutinas personalizadas.</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-success/20 text-success flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span><strong className="text-foreground">Informes de Progreso</strong> para compartir con tu entrenador.</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-success/20 text-success flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span><strong className="text-foreground">Insignia Dorada Titán</strong> en tu perfil.</span>
            </li>
          </ul>
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleCheckout}
          className="w-full h-12 bg-gradient-to-r from-primary to-emerald-600 text-primary-foreground font-extrabold text-sm rounded-2xl shadow-lg shadow-primary/20 hover:opacity-95 gap-2"
        >
          <Zap className="w-4 h-4 fill-primary-foreground" />
          Obtener Acceso PRO Ahora
        </Button>

        {/* Guarantee */}
        <p className="text-[11px] text-center text-muted-foreground flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-success" />
          Cancela en cualquier momento con 1 clic sin compromisos.
        </p>

        {/* Promo Code Form */}
        <form onSubmit={handleRedeemCode} className="pt-2 border-t flex gap-2">
          <div className="relative flex-1">
            <Tag className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="¿Tienes un cupón? (ej: TITAN)"
              className="h-10 text-xs pl-8 uppercase"
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={promoLoading || !promoCode.trim()}
            className="h-10 text-xs font-semibold"
          >
            Canjear
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
