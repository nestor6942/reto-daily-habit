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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ExerciseAdvisor } from "@/components/ExerciseAdvisor";
import { useNavigate } from "react-router-dom";
import { PageMeta } from "@/components/PageMeta";
import { calculateGamification } from "@/lib/achievements";
import { soundManager } from "@/lib/soundEffects";
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
  const [soundEnabled, setSoundEnabled] = useState(soundManager.isEnabled());

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

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Reto Diario — Seguimiento de ejercicio y hábitos"
        description="Rastrea tus retos diarios de ejercicio y hábitos con rachas, mapa de calor, medallas y un asistente de IA personalizado."
        path="/"
      />
      <CelebrationOverlay show={showCelebration} streakCount={streakCount} />

      <main className="mx-auto max-w-md px-4 pb-12">
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
              {isGuest && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border">
                  Invitado
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Supera tus metas un día a la vez
            </p>
          </div>

          <div className="flex items-center gap-1">
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
                      ¡Acepta el reto sugerido del día o crea tus propios hábitos!
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
                <AddChallengeForm onAdd={addChallenge} />
              </motion.div>
            </TabsContent>

            {/* TAB: ESTADÍSTICAS */}
            <TabsContent value="analytics" className="mt-0">
              <AnalyticsDashboard
                challenges={challenges}
                history={history}
                streakCount={streakCount}
                bestStreak={bestStreak}
              />
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
    </div>
  );
};

export default Index;
