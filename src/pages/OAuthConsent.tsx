import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) return setError("Falta el parámetro authorization_id");
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?next=" + encodeURIComponent(next);
        return;
      }
      const { data, error } = await (supabase.auth as any).oauth.getAuthorizationDetails(
        authorizationId,
      );
      if (!active) return;
      if (error) return setError(error.message);
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const oauth = (supabase.auth as any).oauth;
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      return setError(error.message);
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      return setError("El servidor de autorización no devolvió una URL de redirección.");
    }
    window.location.href = target;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <main className="w-full max-w-sm space-y-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
          <Target className="w-8 h-8 text-primary" />
        </div>
        {error ? (
          <>
            <h1 className="text-xl font-bold text-foreground">No se pudo cargar la solicitud</h1>
            <p className="text-sm text-muted-foreground">{error}</p>
          </>
        ) : !details ? (
          <>
            <h1 className="text-xl font-bold text-foreground">Cargando…</h1>
            <div className="animate-spin mx-auto rounded-full h-6 w-6 border-b-2 border-primary" />
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-foreground">
              Conectar {details.client?.name ?? "una aplicación"} a tu cuenta
            </h1>
            <p className="text-sm text-muted-foreground">
              Esto permitirá que {details.client?.name ?? "la aplicación"} acceda a tus retos,
              rachas y perfil en Reto Diario en tu nombre.
            </p>
            <div className="flex flex-col gap-2">
              <Button className="h-12" disabled={busy} onClick={() => decide(true)}>
                Aprobar
              </Button>
              <Button variant="outline" className="h-12" disabled={busy} onClick={() => decide(false)}>
                Denegar
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
