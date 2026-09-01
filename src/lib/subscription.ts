export type SubscriptionTier = "free" | "pro" | "lifetime";

export interface SubscriptionState {
  tier: SubscriptionTier;
  isPro: boolean;
  expiresAt: string | null;
  planName: string;
}

export const FREE_HABIT_LIMIT = 3;

const PROMO_CODES: Record<string, { tier: SubscriptionTier; label: string }> = {
  BETA2026: { tier: "lifetime", label: "Acceso Beta Vitalicio" },
  TITAN: { tier: "lifetime", label: "Membresía Titán de por Vida" },
  PROMO100: { tier: "pro", label: "Membresía Anual PRO" },
  VIPFITNESS: { tier: "lifetime", label: "Acceso VIP Exclusivo" },
};

export const subscriptionManager = {
  getSubscription(): SubscriptionState {
    if (typeof window === "undefined") {
      return {
        tier: "free",
        isPro: false,
        expiresAt: null,
        planName: "Plan Gratuito",
      };
    }

    const tier = (localStorage.getItem("reto_sub_tier") as SubscriptionTier) || "free";
    const expiresAt = localStorage.getItem("reto_sub_expires");
    const isPro = tier === "pro" || tier === "lifetime";

    let planName = "Plan Gratuito";
    if (tier === "lifetime") planName = "👑 PRO Vitalicio";
    else if (tier === "pro") planName = "⭐ PRO Premium";

    return {
      tier,
      isPro,
      expiresAt,
      planName,
    };
  },

  redeemPromoCode(code: string): { success: boolean; message: string; tier?: SubscriptionTier } {
    const cleanCode = code.trim().toUpperCase();
    const match = PROMO_CODES[cleanCode];

    if (match) {
      localStorage.setItem("reto_sub_tier", match.tier);
      localStorage.setItem("reto_sub_plan", match.label);
      return {
        success: true,
        message: `¡Código canjeado con éxito! Has desbloqueado: ${match.label}`,
        tier: match.tier,
      };
    }

    return {
      success: false,
      message: "Código promocional inválido o expirado",
    };
  },

  setTier(tier: SubscriptionTier) {
    if (typeof window === "undefined") return;
    localStorage.setItem("reto_sub_tier", tier);
  },

  // Checkout URLs (can be configured via Vite Env variables or defaults)
  getCheckoutUrls() {
    return {
      monthly:
        import.meta.env.VITE_STRIPE_MONTHLY_URL ||
        "https://buy.stripe.com/test_monthly_retodiario",
      annual:
        import.meta.env.VITE_STRIPE_ANNUAL_URL ||
        "https://buy.stripe.com/test_annual_retodiario",
      lifetime:
        import.meta.env.VITE_STRIPE_LIFETIME_URL ||
        "https://buy.stripe.com/test_lifetime_retodiario",
    };
  },
};
