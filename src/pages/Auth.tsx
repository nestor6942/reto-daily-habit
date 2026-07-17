import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Target, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PageMeta } from "@/components/PageMeta";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";


type View = "login" | "register" | "forgot";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return fallback;
};

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function Auth() {
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) throw error;
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Error al iniciar sesión con Google"));
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (view === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("¡Bienvenido de vuelta!");
      } else if (view === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("¡Revisa tu correo para confirmar tu cuenta!");
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Ha ocurrido un error"));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("¡Revisa tu correo! Te hemos enviado un enlace para restablecer tu contraseña.");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Ha ocurrido un error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <PageMeta
        title={
          view === "forgot"
            ? "Recuperar contraseña — Reto Diario"
            : view === "register"
            ? "Crear cuenta — Reto Diario"
            : "Iniciar sesión — Reto Diario"
        }
        description={
          view === "forgot"
            ? "Restablece tu contraseña de Reto Diario con un enlace enviado a tu correo electrónico."
            : view === "register"
            ? "Crea tu cuenta gratuita en Reto Diario y empieza a rastrear tus retos diarios de ejercicio y hábitos."
            : "Inicia sesión en Reto Diario para continuar con tus retos diarios, rachas y asistente de ejercicios."
        }
        path="/auth"
      />
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <main className="w-full max-w-sm">
      <AnimatePresence mode="wait">

        {view === "forgot" ? (
          <motion.div
            key="forgot"
            className="w-full max-w-sm space-y-6"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="text-center space-y-2">
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
              >
                <Target className="w-8 h-8 text-primary" />
              </motion.div>
              <h1 className="text-2xl font-bold text-foreground">Recuperar contraseña</h1>
              <p className="text-sm text-muted-foreground">
                Ingresa tu correo y te enviaremos un enlace para restablecerla
              </p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="forgot-email">Correo electrónico</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                  autoFocus
                />
              </div>

              <motion.div whileTap={{ scale: 0.98 }}>
                <Button type="submit" className="w-full h-12" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar enlace"}
                </Button>
              </motion.div>
            </form>

            <button
              onClick={() => setView("login")}
              className="flex items-center gap-1 mx-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesión
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={view}
            className="w-full max-w-sm space-y-6"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="text-center space-y-2">
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-2"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
              >
                <Target className="w-8 h-8 text-primary" />
              </motion.div>
              <h1 className="text-2xl font-bold text-foreground">Reto Diario</h1>
              <p className="text-sm text-muted-foreground">
                {view === "login" ? "Inicia sesión para continuar" : "Crea tu cuenta"}
              </p>
            </div>

            <motion.form
              onSubmit={handleSubmit}
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <div className="space-y-1">
                <Label htmlFor="auth-email">Correo electrónico</Label>
                <Input
                  id="auth-email"
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="auth-password">Contraseña</Label>
                <Input
                  id="auth-password"
                  type="password"
                  placeholder="Al menos 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12"
                />
              </div>


              {view === "login" && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setView("forgot")}
                    className="text-sm text-primary hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}

              <motion.div whileTap={{ scale: 0.98 }}>
                <Button type="submit" className="w-full h-12" disabled={loading}>
                  {loading
                    ? "Cargando..."
                    : view === "login"
                    ? "Iniciar sesión"
                    : "Crear cuenta"}
                </Button>
              </motion.div>

              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">
                  o
                </span>
              </div>

              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 gap-2"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  {googleLoading ? "Conectando..." : "Continuar con Google"}
                </Button>
              </motion.div>
            </motion.form>

            <p className="text-center text-sm text-muted-foreground">
              {view === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
              <button
                onClick={() => setView(view === "login" ? "register" : "login")}
                className="text-primary font-medium hover:underline"
              >
                {view === "login" ? "Regístrate" : "Inicia sesión"}
              </button>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      </main>
    </div>
  );
}
