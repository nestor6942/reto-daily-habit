import { useState, useEffect, useMemo } from "react";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChallengeCard } from "@/components/ChallengeCard";
import { AddChallengeForm } from "@/components/AddChallengeForm";
import { StreakBadge } from "@/components/StreakBadge";
import { HistoryList } from "@/components/HistoryList";
import { MotivationalBanner } from "@/components/MotivationalBanner";
import { CelebrationOverlay } from "@/components/CelebrationOverlay";
import { DailyChallengeSuggestion } from "@/components/DailyChallengeSuggestion";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { AchievementsModal } from "@/components/AchievementsModal";
import { PricingModal } from "@/components/PricingModal";
import { PremiumProgramsModal } from "@/components/PremiumPrograms";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";
import { RecommendedGear } from "@/components/RecommendedGear";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { ShareStreakModal } from "@/components/ShareStreakModal";
import { HeatmapCalendar } from "@/components/HeatmapCalendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Target,
  BarChart3,
  History,
  Award,
  Crown,
  Sparkles,
  Zap,
  Flame,
  Share2,
  Bot,
  Calendar,
  ShieldCheck,
  CheckCircle2,
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    challenges,
    history,
    streakCount,
    bestStreak,
    loading,
    isGuest,
    syncStatus,
    lastSyncedAt,
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
  const [shareModalOpen, setShareModalOpen] = useState(false);
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <motion.div
          className="rounded-full h-10 w-10 border-b-2 border-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p className="text-xs font-semibold text-muted-foreground animate-pulse">
          Cargando tus retos seguros...
        </p>
      </div>
    );
  }

  const reachedFreeLimit = !subscription.isPro && challenges.length >= FREE_HABIT_LIMIT;

  const todayFormatted = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between text-foreground selection:bg-primary/20">
      <PageMeta
        title="Reto Diario — Tu Aplicación y Web de Hábitos y Ejercicio"
        description="Rastrea tus retos diarios de ejercicio y hábitos con persistencia permanente en la nube, rachas, matriz de constancia, medallas y un entrenador de IA."
        path="/"
      />

      <CelebrationOverlay show={showCelebration} streakCount={streakCount} />

      {/* Top Navbar */}
      <Navbar
        streakCount={streakCount}
        bestStreak={bestStreak}
        isPro={subscription.isPro}
        isGuest={isGuest}
        soundEnabled={soundEnabled}
        syncStatus={syncStatus}
        lastSyncedAt={lastSyncedAt}
        onToggleSound={toggleSound}
        onOpenAchievements={() => setAchievementsOpen(true)}
        onOpenPricing={() => setPricingOpen(true)}
      />

      {/* Main Content Area: Responsive Hybrid Layout (Mobile View & Desktop 2-Column Grid) */}
      <main className="max-w-6xl mx-auto w-full px-4 py-6 flex-1">
        {/* Mobile Header Greeting */}
        <div className="lg:hidden mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground capitalize">
              {todayFormatted}
            </h2>
            <p className="text-sm font-extrabold text-foreground">
              {challenges.length > 0
                ? `${completedCount} de ${challenges.length} retos completados hoy`
                : "Comienza tus hábitos hoy"}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShareModalOpen(true)}
            className="h-8 text-xs font-bold gap-1 rounded-xl border-streak/30 text-streak"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Compartir</span>
          </Button>
        </div>

        {/* Mobile Top Streak Badge & Banner */}
        <div className="lg:hidden space-y-3 mb-4">
          <StreakBadge count={streakCount} bestStreak={bestStreak} />
          <MotivationalBanner
            streakCount={streakCount}
            challengesCount={challenges.length}
            completedCount={completedCount}
          />
        </div>

        {/* Responsive Grid Layout */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
          {/* Main Column (Tabs & Challenge Flow): 7 cols on Desktop */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            <Tabs defaultValue="today" className="w-full">
              <TabsList className="w-full mb-4 h-12 bg-muted/70 p-1 rounded-2xl border">
                <TabsTrigger
                  value="today"
                  className="flex-1 h-10 gap-1.5 rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all"
                >
                  <Target className="w-4 h-4 text-primary" />
                  <span>Hoy</span>
                  {challenges.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted font-bold text-muted-foreground ml-1">
                      {completedCount}/{challenges.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="flex-1 h-10 gap-1.5 rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all"
                >
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <span>Estadísticas</span>
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="flex-1 h-10 gap-1.5 rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all"
                >
                  <History className="w-4 h-4 text-primary" />
                  <span>Historial</span>
                </TabsTrigger>
              </TabsList>

              {/* TAB: HOY */}
              <TabsContent value="today" className="space-y-4 mt-0">
                {/* Desktop Date Bar */}
                <div className="hidden lg:flex items-center justify-between pb-2 border-b">
                  <div>
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground capitalize">
                      {todayFormatted}
                    </h2>
                    <h3 className="text-xl font-black text-foreground tracking-tight">
                      {allDone
                        ? "🎉 ¡Todos los retos completados! Increíble día."
                        : `Retos del Día (${completedCount}/${challenges.length})`}
                    </h3>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShareModalOpen(true)}
                    className="h-8 text-xs font-bold gap-1.5 rounded-xl border-streak/30 text-streak hover:bg-streak/10"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Compartir Racha</span>
                  </Button>
                </div>

                {/* 21-Day Programs Action Bar */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => setProgramsOpen(true)}
                    variant="outline"
                    className="flex-1 h-11 rounded-2xl text-xs font-extrabold border-primary/30 bg-gradient-to-r from-primary/5 via-card to-amber-500/5 hover:bg-primary/10 text-foreground gap-2 shadow-sm"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Programas Guiados de 21 Días</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-black ml-auto">
                      Nuevo
                    </span>
                  </Button>
                </div>

                {/* Category Filter Pills */}
                {challenges.length > 0 && (
                  <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
                    {CATEGORY_FILTERS.map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => setActiveCategory(cat.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                          activeCategory === cat.key
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-card/70 text-muted-foreground border-border/70 hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        {cat.emoji} {cat.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Daily Challenge Suggestion (if 0 challenges) */}
                <DailyChallengeSuggestion
                  onAccept={handleAcceptDailyChallenge}
                  hasChallenges={challenges.length > 0}
                />

                {/* Free Limit Notice Banner */}
                {reachedFreeLimit && (
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                      <p className="text-xs text-foreground font-semibold">
                        Has alcanzado el límite de 3 hábitos gratuitos.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setPricingOpen(true)}
                      className="h-8 text-xs font-bold bg-amber-500 text-white rounded-xl shadow-sm hover:bg-amber-600"
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
                      className="text-center bg-card rounded-3xl border border-dashed p-10 my-2 space-y-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto">
                        <Target className="w-7 h-7" />
                      </div>
                      <h4 className="font-extrabold text-foreground text-base">
                        No tienes retos creados todavía
                      </h4>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                        ¡Acepta el reto sugerido del día, inscríbete en un programa de 21 días o añade tus propios hábitos abajo!
                      </p>
                    </motion.div>
                  )}

                  <div className="space-y-3">
                    {filteredChallenges.map((c, i) => (
                      <motion.div
                        key={c.id}
                        layout
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -50, scale: 0.92 }}
                        transition={{
                          duration: 0.25,
                          delay: i * 0.03,
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
                  </div>
                </AnimatePresence>

                {/* Add Challenge Form */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="pt-2"
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
          </div>

          {/* Desktop Sidebar (5 cols on Desktop): Live Streak Card, Motivational Quote, Heatmap & AI Coach */}
          <aside className="hidden lg:block lg:col-span-5 xl:col-span-4 space-y-4 sticky top-20">
            {/* Live Streak Card with Share Action */}
            <div className="rounded-3xl border bg-gradient-to-br from-card via-background to-streak/10 p-5 shadow-sm space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Tu Racha Actual
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShareModalOpen(true)}
                  className="h-7 px-2 text-xs font-bold text-streak hover:bg-streak/10 gap-1 rounded-xl"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Compartir</span>
                </Button>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-foreground tracking-tight">
                  {streakCount}
                </span>
                <span className="text-sm font-bold text-muted-foreground">
                  {streakCount === 1 ? "día consecutivo" : "días consecutivos"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 rounded-2xl bg-card border">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">Mejor Récord</span>
                  <p className="text-sm font-black text-foreground">{bestStreak} días</p>
                </div>
                <div className="p-2.5 rounded-2xl bg-card border">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">Nivel Atleta</span>
                  <p className="text-sm font-black text-primary">{gamification.levelTitle}</p>
                </div>
              </div>
            </div>

            {/* Daily Motivational Banner */}
            <MotivationalBanner
              streakCount={streakCount}
              challengesCount={challenges.length}
              completedCount={completedCount}
            />

            {/* Quick Consistency Heatmap Widget */}
            <HeatmapCalendar history={history} daysToShow={28} />

            {/* AI Assistant Quick Callout */}
            <div className="rounded-2xl border bg-card p-4 space-y-2.5 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-foreground">Asesor de Ejercicios IA</h4>
                  <p className="text-[11px] text-muted-foreground">Recomendaciones basadas en tu IMC</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                ¿Dudas sobre postura o qué entrenar hoy? Haz clic en el botón flotante de la esquina inferior para chatear en tiempo real.
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Floating AI Exercise Advisor */}
      <ExerciseAdvisor />

      {/* Achievements Modal */}
      <AchievementsModal
        open={achievementsOpen}
        onOpenChange={setAchievementsOpen}
        gamification={gamification}
      />

      {/* Pricing / PRO Modal */}
      <PricingModal
        open={pricingOpen}
        onOpenChange={setPricingOpen}
        onSubscriptionChange={() =>
          setSubscription(subscriptionManager.getSubscription())
        }
      />

      {/* 21-Day Programs Modal */}
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

      {/* Share Streak Modal */}
      <ShareStreakModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        streakCount={streakCount}
        bestStreak={bestStreak}
        completedCount={completedCount}
      />

      {/* PWA Mobile Install Banner */}
      <PwaInstallPrompt />

      {/* Cookie & GDPR Consent Banner */}
      <CookieConsentBanner />

      {/* Professional Footer */}
      <Footer />
    </div>
  );
};

export default Index;
