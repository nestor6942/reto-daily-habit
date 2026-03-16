import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/contexts/AuthContext";
import { ChallengeCard } from "@/components/ChallengeCard";
import { AddChallengeForm } from "@/components/AddChallengeForm";
import { StreakBadge } from "@/components/StreakBadge";
import { HistoryList } from "@/components/HistoryList";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Target, History, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ExerciseAdvisor } from "@/components/ExerciseAdvisor";

const Index = () => {
  const { signOut } = useAuth();
  const {
    challenges,
    history,
    streakCount,
    loading,
    addChallenge,
    increment,
    removeChallenge,
  } = useAppData();

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
      <div className="mx-auto max-w-md px-4 pb-8">
        {/* Header */}
        <motion.header
          className="flex items-center justify-between pt-6 pb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Reto Diario
            </h1>
            <p className="text-sm text-muted-foreground">
              Supera tus metas cada día
            </p>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button
              size="icon"
              variant="ghost"
              onClick={signOut}
              className="w-10 h-10 text-muted-foreground"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </motion.header>

        {/* Streak */}
        <AnimatePresence>
          {streakCount > 0 && (
            <motion.div
              className="mb-5"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <StreakBadge count={streakCount} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Tabs defaultValue="today" className="w-full">
            <TabsList className="w-full mb-4 h-12 bg-muted">
              <TabsTrigger value="today" className="flex-1 h-10 gap-2 data-[state=active]:bg-card transition-all">
                <Target className="w-4 h-4" />
                Hoy
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1 h-10 gap-2 data-[state=active]:bg-card transition-all">
                <History className="w-4 h-4" />
                Historial
              </TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="space-y-3 mt-0">
              <AnimatePresence mode="popLayout">
                {challenges.length === 0 && (
                  <motion.p
                    key="empty"
                    className="text-center text-muted-foreground py-6 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    No tienes retos aún. ¡Añade uno!
                  </motion.p>
                )}
                {challenges.map((c, i) => (
                  <motion.div
                    key={c.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -100, scale: 0.9 }}
                    transition={{
                      duration: 0.3,
                      delay: i * 0.05,
                      layout: { type: "spring", stiffness: 300, damping: 30 },
                    }}
                  >
                    <ChallengeCard
                      challenge={c}
                      onIncrement={() => increment(c.id)}
                      onRemove={() => removeChallenge(c.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <AddChallengeForm onAdd={addChallenge} />
              </motion.div>
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <HistoryList history={history} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
