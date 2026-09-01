import { useState, useEffect, useMemo } from "react";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/contexts/AuthContext";
import { ChallengeCard } from "@/components/ChallengeCard";
import { AddChallengeForm } from "@/components/AddChallengeForm";
import { StreakBadge } from "@/components/StreakBadge";
import { HistoryList } from "@/components/HistoryList";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MotivationalBanner } from "@/components/MotivationalBanner";
import { CelebrationOverlay } from "@/components/CelebrationOverlay";
import { DailyChallengeSuggestion } from "@/components/DailyChallengeSuggestion";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { AchievementsModal } from "@/components/AchievementsModal";
import { PricingModal } from "@/components/PricingModal";
import { PremiumProgramsModal } from "@/components/PremiumPrograms";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";
import { RecommendedGear } from "@/components/RecommendedGear";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Target,
  BarChart3,
  History,
  LogOut,
  UserCircle,
  Award,
  Volume2,
  VolumeX,
  LogIn,
  Crown,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ExerciseAdvisor } from "@/components/ExerciseAdvisor";
import { useNavigate } from "react-router-dom";
import { PageMeta } from "@/components/PageMeta";
import { calculateGamification } from "@/lib/achievements";
import { soundManager } from "@/lib/soundEffects";
import { subscriptionManager, FREE_HABIT_LIMIT } from "@/lib/subscription";
import type { HabitCategory } from "@/types/challenge";

const CATEGORY_FILTERS: { key: string; label: string; emoji: string }[] = [
  { key: "all", label: "Todos", emoji: "🎯" },
  { key: "fuerza", label: "Fuerza", emoji: "💪" },
  { key: "cardio", label: "Cardio", emoji: "🏃" },
  { key: "flexibilidad", label: "Flex", emoji: "🧘" },
  { key: "mente", label: "Mente", emoji: "🧠" },
  { key: "nutricion", label: "Nutrición", emoji: "🥗" },
];

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const {
    challenges,
    history,
    streakCount,
    bestStreak,
    loading,
    isGuest,
    addChallenge,
    updateChallenge,
    increment,
    decrement,
    toggleComplete,
    resetChallenge,
    removeChallenge,
  } = useAppData();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showCelebration, setShowCelebration] = useState(false);
  const [prevAllDone, setPrevAllDone] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [programsOpen, setProgramsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(soundManager.isEnabled());
  const [subscription, setSubscription] = useState(subscriptionManager.getSubscription());

  const completedCount = challenges.filter(
    (c) => c.currentValue >= c.targetValue
  ).length;
  const allDone = challenges.length > 0 && completedCount === challenges.length;

  const gamification = useMemo(
    () => calculateGamification(challenges, history, streakCount, bestStreak),
    [challenges, history, streakCount, bestStreak]
  );

  const filteredChallenges = useMemo(() => {
    if (activeCategory === "all") return challenges;
    return challenges.filter((c) => c.category === activeCategory);
  }, [challenges, activeCategory]);

  useEffect(() => {
    if (allDone && !prevAllDone) {
      setShowCelebration(true);
      const t = setTimeout(() => setShowCelebration(false), 5000);
      return () => clearTimeout(t);
    }
    setPrevAllDone(allDone);
  }, [allDone, prevAllDone]);

  const toggleSound = () => {
    const next = !soundEnabled;
    soundManager.setEnabled(next);
    setSoundEnabled(next);
    if (next) soundManager.playPop();
  };

  const handleAcceptDailyChallenge = async (
    exercises: { name: string; target: number }[]
  ) => {
    for (const ex of exercises) {
      await addChallenge(ex.name, ex.target, "reps", "fuerza");
    }
  };

  const handleEnrollProgram = async (
    progChallenges: { name: string; target: number; unit: string; category: HabitCategory }[]
  ) => {
    for (const item of progChallenges) {
      await addChallenge(item.name, item.target, item.unit, item.category);
    }
  };

  const handleAddChallengeWithLimit = async (
    name: string,
    target: number,
    unit?: string,
    category?: HabitCategory
  ) => {
    if (!subscription.isPro && challenges.length >= FREE_HABIT_LIMIT) {
      setPricingOpen(true);
      return;
    }
    await addChallenge(name, target, unit, category);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          className="rounded-full h-8 w-8 border-b-2 border-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  const reachedFreeLimit = !subscription.isPro && challenges.length >= FREE_HABIT_LIMIT;

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Reto Diario — Seguimiento de ejercicio y hábitos"
        description="Rastrea tus retos diarios de ejercicio y hábitos con rachas, mapa de calor, medallas y un asistente de IA personalizado."
        path="/"
      />
      <CelebrationOverlay show={showCelebration} streakCount={streakCount} />

      <main className="mx-auto max-w-md px-4 pb-16">
        {/* Header */}
        <motion.header
          className="flex items-center justify-between pt-6 pb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-foreground">
                Reto Diario
              </h1>
              {subscription.isPro ? (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center gap-1">
                  <Crown className="w-3 h-3" /> PRO
                </span>
              ) : isGuest ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border">
                  Invitado
                </span>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">
              Supera tus metas un día a la vez
            </p>
          </div>

          <div className="flex items-center gap-1">
            {/* PRO Upgrade Button (if free) */}
            {!subscription.isPro && (
              <Button
                size="sm"
                onClick={() => setPricingOpen(true)}
                className="h-8 px-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-streak text-white font-extrabold text-xs shadow-sm hover:opacity-90 gap-1"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>PRO</span>
              </Button>
            )}

            {/* Gamification / Badges Button */}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setAchievementsOpen(true)}
              className="w-9 h-9 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 relative"
              title="Ver Logros y Medallas"
              aria-label="Ver Logros"
            >
              <Award className="w-5 h-5" />
            </Button>

            {/* Sound Toggle */}
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleSound}
              className="w-9 h-9 text-muted-foreground"
              title={soundEnabled ? "Silenciar sonidos" : "Activar sonidos"}
              aria-label="Alternar sonido"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>

            <ThemeToggle />

            {/* Profile or Login */}
            {user ? (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => navigate("/profile")}
                  className="w-9 h-9 text-muted-foreground"
                  title="Mi perfil"
                  aria-label="Ir a mi perfil"
                >
                  <UserCircle className="w-5 h-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={signOut}
                  className="w-9 h-9 text-muted-foreground hover:text-destructive"
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("/auth")}
                className="h-9 gap-1 text-xs font-semibold"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </Button>
            )}
          </div>
        </motion.header>

        {/* Streak & Best Record Badge */}
        <div className="mb-4">
          <StreakBadge count={streakCount} bestStreak={bestStreak} />
        </div>

        {/* Motivational Banner */}
        <MotivationalBanner
          streakCount={streakCount}
          challengesCount={challenges.length}
          completedCount={completedCount}
        />

        {/* Main Tabs (Hoy | Estadísticas | Historial) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <Tabs defaultValue="today" className="w-full">
            <TabsList className="w-full mb-4 h-12 bg-muted p-1 rounded-2xl">
              <TabsTrigger
                value="today"
                className="flex-1 h-10 gap-1.5 rounded-xl font-semibold text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all"
              >
                <Target className="w-4 h-4" />
                Hoy
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex-1 h-10 gap-1.5 rounded-xl font-semibold text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all"
              >
                <BarChart3 className="w-4 h-4" />
                Estadísticas
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="flex-1 h-10 gap-1.5 rounded-xl font-semibold text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all"
              >
                <History className="w-4 h-4" />
                Historial
              </TabsTrigger>
            </TabsList>

            {/* TAB: HOY */}
            <TabsContent value="today" className="space-y-3 mt-0">
              {/* Programs Button Bar */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setProgramsOpen(true)}
                  variant="outline"
                  className="flex-1 h-11 rounded-2xl text-xs font-bold border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Programas de 21 Días
                </Button>
              </div>

              {/* Category Filter Pills */}
              {challenges.length > 0 && (
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {CATEGORY_FILTERS.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setActiveCategory(cat.key)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                        activeCategory === cat.key
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-secondary/60 text-muted-foreground border-border/60 hover:text-foreground"
                      }`}
                    >
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Daily Challenge Suggestion */}
              <DailyChallengeSuggestion
                onAccept={handleAcceptDailyChallenge}
                hasChallenges={challenges.length > 0}
              />

              {/* Free Limit Warning Banner */}
              {reachedFreeLimit && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                    <p className="text-xs text-foreground font-medium">
                      Límite de 3 hábitos del plan gratuito.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setPricingOpen(true)}
                    className="h-7 text-[11px] font-bold bg-amber-500 text-white rounded-lg"
                  >
                    Desbloquear PRO
                  </Button>
                </div>
              )}

              {/* Challenge Cards List */}
              <AnimatePresence mode="popLayout">
                {challenges.length === 0 && (
                  <motion.div
                    key="empty"
                    className="text-center bg-card rounded-2xl border border-dashed p-8 my-2 space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Target className="w-10 h-10 text-primary/40 mx-auto" />
                    <p className="font-semibold text-foreground text-sm">
                      No tienes retos creados todavía
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ¡Acepta el reto sugerido del día, inscríbete en un programa o crea tus hábitos!
                    </p>
                  </motion.div>
                )}

                {filteredChallenges.map((c, i) => (
                  <motion.div
                    key={c.id}
                    layout
                    initial={{ opacity: 0, y: 15, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -60, scale: 0.9 }}
                    transition={{
                      duration: 0.25,
                      delay: i * 0.04,
                      layout: { type: "spring", stiffness: 350, damping: 28 },
                    }}
                  >
                    <ChallengeCard
                      challenge={c}
                      onIncrement={() => increment(c.id)}
                      onDecrement={() => decrement(c.id)}
                      onToggleComplete={() => toggleComplete(c.id)}
                      onReset={() => resetChallenge(c.id)}
                      onRemove={() => removeChallenge(c.id)}
                      onUpdate={updateChallenge}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add Challenge Form */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="pt-1"
              >
                <AddChallengeForm onAdd={handleAddChallengeWithLimit} />
              </motion.div>
            </TabsContent>

            {/* TAB: ESTADÍSTICAS */}
            <TabsContent value="analytics" className="space-y-4 mt-0">
              <AnalyticsDashboard
                challenges={challenges}
                history={history}
                streakCount={streakCount}
                bestStreak={bestStreak}
              />
              <RecommendedGear />
            </TabsContent>

            {/* TAB: HISTORIAL */}
            <TabsContent value="history" className="mt-0">
              <HistoryList history={history} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      {/* AI Exercise Advisor */}
      <ExerciseAdvisor />

      {/* Achievements Modal */}
      <AchievementsModal
        open={achievementsOpen}
        onOpenChange={setAchievementsOpen}
        gamification={gamification}
      />

      {/* Pricing / Monetization Modal */}
      <PricingModal
        open={pricingOpen}
        onOpenChange={setPricingOpen}
        onSubscriptionChange={() =>
          setSubscription(subscriptionManager.getSubscription())
        }
      />

      {/* 21-Day Guided Programs Modal */}
      <PremiumProgramsModal
        open={programsOpen}
        onOpenChange={setProgramsOpen}
        isPro={subscription.isPro}
        onEnroll={handleEnrollProgram}
        onUpgradeClick={() => {
          setProgramsOpen(false);
          setPricingOpen(true);
        }}
      />

      {/* PWA Mobile Install Banner */}
      <PwaInstallPrompt />
    </div>
  );
};

export default Index;
