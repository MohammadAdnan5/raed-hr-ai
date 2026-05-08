import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

type State = "loading" | "valid" | "already" | "invalid" | "submitting" | "done" | "error";

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    if (!token) { setState("invalid"); return; }
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: SUPABASE_ANON_KEY } }
        );
        const data = await res.json();
        if (data.valid) setState("valid");
        else if (data.reason === "already_unsubscribed") setState("already");
        else setState("invalid");
      } catch {
        setState("error");
      }
    })();
  }, [token]);

  const confirm = async () => {
    if (!token) return;
    setState("submitting");
    const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
      body: { token },
    });
    if (error) setState("error");
    else if (data?.success) setState("done");
    else if (data?.reason === "already_unsubscribed") setState("already");
    else setState("error");
  };

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center shadow-sm">
        {state === "loading" && <p className="text-muted-foreground">جارٍ التحقق...</p>}
        {state === "valid" && (
          <>
            <h1 className="text-xl font-bold mb-3">تأكيد إلغاء الاشتراك</h1>
            <p className="text-muted-foreground mb-6">لن تتلقى أي رسائل بريدية مستقبلية من المنصة.</p>
            <Button onClick={confirm} className="w-full">تأكيد إلغاء الاشتراك</Button>
          </>
        )}
        {state === "submitting" && <p>جارٍ المعالجة...</p>}
        {state === "done" && <p className="text-success">✅ تم إلغاء اشتراكك بنجاح.</p>}
        {state === "already" && <p className="text-muted-foreground">تم إلغاء اشتراكك مسبقاً.</p>}
        {state === "invalid" && <p className="text-destructive">رابط غير صالح أو منتهي.</p>}
        {state === "error" && <p className="text-destructive">حدث خطأ، يرجى المحاولة لاحقاً.</p>}
      </div>
    </div>
  );
}
