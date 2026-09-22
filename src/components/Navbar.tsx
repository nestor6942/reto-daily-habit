import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Target,
  Crown,
  Award,
  Volume2,
  VolumeX,
  UserCircle,
  LogOut,
  LogIn,
  Cloud,
  CloudOff,
  Flame,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import type { SyncStatus } from "@/hooks/useAppData";

interface Props {
  streakCount: number;
  bestStreak: number;
  isPro: boolean;
  isGuest: boolean;
  soundEnabled: boolean;
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
  onToggleSound: () => void;
  onOpenAchievements: () => void;
  onOpenPricing: () => void;
}

export function Navbar({
  streakCount,
  bestStreak,
  isPro,
  isGuest,
  soundEnabled,
  syncStatus,
  lastSyncedAt,
  onToggleSound,
  onOpenAchievements,
  onOpenPricing,
}: Props) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-xl border-b transition-colors">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
        {/* Brand Logo & Name */}
        <Link
          to="/"
          className="flex items-center gap-2.5 hover:opacity-90 transition-opacity shrink-0"
        >
          <motion.div
            className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center text-white shadow-md shadow-primary/20"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Target className="w-5 h-5" />
          </motion.div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-foreground">
                Reto Diario
              </span>
              {isPro && (
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center gap-0.5">
                  <Crown className="w-3 h-3" /> PRO
                </span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground hidden sm:inline">
              Supera tus metas un día a la vez
            </span>
          </div>
        </Link>

        {/* Center / Cloud Sync & Quick Streak Indicator */}
        <div className="hidden md:flex items-center gap-3">
          {/* Cloud Sync Status */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border bg-card/60"
            title={
              user
                ? `Guardado permanente en la nube • Última sincronización: ${lastSyncedAt || "Reciente"}`
                : "Modo almacenamiento local en navegador"
            }
          >
            {user ? (
              syncStatus === "syncing" ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  >
                    <Cloud className="w-3.5 h-3.5 text-primary" />
                  </motion.div>
                  <span className="text-[11px] text-muted-foreground">Sincronizando...</span>
                </>
              ) : syncStatus === "offline" ? (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[11px] text-amber-600 dark:text-amber-400">Modo sin conexión</span>
                </>
              ) : (
                <>
                  <Cloud className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[11px] text-primary">Nube Permanente</span>
                </>
              )
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
              >
                <span>💾 Modo local</span>
                <span className="text-primary font-bold hover:underline">• Guardar en nube</span>
              </button>
            )}
          </div>

          {/* Streak Counter Quick View */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-streak/10 border border-streak/25 text-xs font-bold text-streak">
            <Flame className="w-4 h-4 fill-streak text-streak animate-pulse" />
            <span>{streakCount} {streakCount === 1 ? "día" : "días"}</span>
          </div>
        </div>

        {/* Right Actions Bar */}
        <div className="flex items-center gap-1.5">
          {/* PRO Upgrade Button (if free) */}
          {!isPro && (
            <Button
              size="sm"
              onClick={onOpenPricing}
              className="h-8 px-2.5 sm:px-3 rounded-xl bg-gradient-to-r from-amber-500 to-streak text-white font-extrabold text-xs shadow-sm hover:opacity-90 gap-1"
            >
              <Crown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mejorar a</span>
              <span>PRO</span>
            </Button>
          )}

          {/* Gamification / Badges Button */}
          <Button
            size="icon"
            variant="ghost"
            onClick={onOpenAchievements}
            className="w-9 h-9 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 rounded-xl"
            title="Logros y Medallas"
            aria-label="Ver Logros"
          >
            <Award className="w-4 h-4" />
          </Button>

          {/* Sound Toggle */}
          <Button
            size="icon"
            variant="ghost"
            onClick={onToggleSound}
            className="w-9 h-9 text-muted-foreground hover:text-foreground rounded-xl"
            title={soundEnabled ? "Silenciar efectos de sonido" : "Activar efectos de sonido"}
            aria-label="Alternar sonido"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-primary" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Profile or Login */}
          {user ? (
            <div className="flex items-center gap-1 pl-1 border-l">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => navigate("/profile")}
                className="w-9 h-9 text-muted-foreground hover:text-foreground rounded-xl"
                title="Mi perfil"
                aria-label="Mi perfil"
              >
                <UserCircle className="w-5 h-5 text-primary" />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => navigate("/auth")}
              className="h-9 px-3 gap-1.5 text-xs font-bold rounded-xl"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
