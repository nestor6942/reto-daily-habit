import { useAppData } from "@/hooks/useAppData";
import { ChallengeCard } from "@/components/ChallengeCard";
import { AddChallengeForm } from "@/components/AddChallengeForm";
import { StreakBadge } from "@/components/StreakBadge";
import { HistoryList } from "@/components/HistoryList";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, History } from "lucide-react";

const Index = () => {
  const {
    challenges,
    history,
    streakCount,
    addChallenge,
    increment,
    removeChallenge,
  } = useAppData();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-4 pb-8">
        {/* Header */}
        <header className="flex items-center justify-between pt-6 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Reto Diario
            </h1>
            <p className="text-sm text-muted-foreground">
              Supera tus metas cada día
            </p>
          </div>
          <ThemeToggle />
        </header>

        {/* Streak */}
        {streakCount > 0 && (
          <div className="mb-5">
            <StreakBadge count={streakCount} />
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="w-full mb-4 h-12 bg-muted">
            <TabsTrigger value="today" className="flex-1 h-10 gap-2 data-[state=active]:bg-card">
              <Target className="w-4 h-4" />
              Hoy
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1 h-10 gap-2 data-[state=active]:bg-card">
              <History className="w-4 h-4" />
              Historial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-3 mt-0">
            {challenges.length === 0 && (
              <p className="text-center text-muted-foreground py-6 text-sm">
                No tienes retos aún. ¡Añade uno!
              </p>
            )}
            {challenges.map((c) => (
              <ChallengeCard
                key={c.id}
                challenge={c}
                onIncrement={() => increment(c.id)}
                onRemove={() => removeChallenge(c.id)}
              />
            ))}
            <AddChallengeForm onAdd={addChallenge} />
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <HistoryList history={history} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
