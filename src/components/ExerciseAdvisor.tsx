import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, X, Weight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/exercise-advisor`;

export function ExerciseAdvisor() {
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [dataSet, setDataSet] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startChat = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!w || w < 20 || w > 300) {
      toast.error("Ingresa un peso válido (20-300 kg)");
      return;
    }
    if (!h || h < 100 || h > 250) {
      toast.error("Ingresa una altura válida (100-250 cm)");
      return;
    }
    setDataSet(true);
    sendMessage("Hola, ¿qué ejercicios me recomiendas?", w, h);
  };

  const sendMessage = async (text: string, w?: number, h?: number) => {
    const userMsg: Msg = { role: "user", content: text };
    const currentMessages = [...messages, userMsg];
    setMessages(currentMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          weight: w || parseFloat(weight),
          height: h || parseFloat(height),
          messages: currentMessages,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Error del servidor" }));
        toast.error(err.error || "Error al contactar al asistente");
        setIsLoading(false);
        return;
      }

      if (!resp.body) throw new Error("No stream body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Error de conexión con el asistente");
    }

    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
  };

  const resetChat = () => {
    setMessages([]);
    setDataSet(false);
    setWeight("");
    setHeight("");
    setInput("");
    setOpen(false);
  };

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
          >
            <Bot className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-[380px] z-50 rounded-2xl border bg-card shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: "70vh" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-primary/5">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                <span className="font-semibold text-sm text-foreground">Asistente de Ejercicios</span>
              </div>
              <button onClick={resetChat} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!weightSet ? (
              /* Weight input */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 space-y-4"
              >
                <div className="text-center space-y-2">
                  <Weight className="w-10 h-10 text-primary mx-auto" />
                  <p className="text-sm text-foreground font-medium">¿Cuánto pesas?</p>
                  <p className="text-xs text-muted-foreground">Te recomendaré ejercicios adecuados para ti</p>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); startChat(); }} className="space-y-3">
                  <Input
                    type="number"
                    placeholder="Tu peso en kg"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    min={20}
                    max={300}
                    className="h-12 text-center text-lg"
                    autoFocus
                  />
                  <Button type="submit" className="w-full h-12 bg-primary text-primary-foreground">
                    Obtener recomendaciones
                  </Button>
                </form>
              </motion.div>
            ) : (
              /* Chat area */
              <>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
                  {messages.filter(m => !(m.role === "user" && m.content === "Hola, ¿qué ejercicios me recomiendas?")).map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted text-foreground rounded-bl-md"
                        }`}
                      >
                        {msg.role === "assistant" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        ) : (
                          msg.content
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe tu pregunta..."
                    disabled={isLoading}
                    className="h-10 text-sm"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={isLoading || !input.trim()}
                    className="h-10 w-10 shrink-0 bg-primary text-primary-foreground"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
