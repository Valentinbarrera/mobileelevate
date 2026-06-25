/**
 * Card del Coach en el Home — el diferenciador de una app coach→alumno.
 * Muestra el último mensaje del coach + badge de no leídos, 1 toque al chat.
 * (Research: la presencia del coach es lo que distingue de un logger genérico.)
 */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { fadeUp } from "@/lib/animations";

const CoachCard = () => {
  const navigate = useNavigate();
  const { student } = useAuthContext();

  const { data } = useQuery({
    queryKey: ["coach-card", student?.id],
    enabled: !!student?.id,
    queryFn: async () => {
      if (!student?.id) return { latest: null as string | null, unseen: 0 };
      const [latestRes, countRes] = await Promise.all([
        supabase
          .from("messages")
          .select("content")
          .eq("student_id", student.id)
          .eq("sender", "coach")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("student_id", student.id)
          .eq("sender", "coach")
          .is("seen_at", null),
      ]);
      return {
        latest: (latestRes.data?.content as string | undefined) ?? null,
        unseen: countRes.count ?? 0,
      };
    },
  });

  const latest = data?.latest ?? null;
  const unseen = data?.unseen ?? 0;

  return (
    <motion.button
      variants={fadeUp}
      onClick={() => navigate("/messages")}
      whileTap={{ scale: 0.99 }}
      className="w-full text-left rounded-2xl card-elevated p-4 flex items-center gap-3.5 active:opacity-90 transition-opacity"
    >
      <div className="relative w-11 h-11 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
        <MessageCircle className="w-5 h-5 text-primary" />
        {unseen > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center ring-2 ring-card">
            {unseen > 9 ? "9+" : unseen}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-primary uppercase tracking-wider">Tu coach</p>
        {latest ? (
          <p className="text-sm text-foreground/90 truncate">{latest}</p>
        ) : (
          <p className="text-sm text-muted-foreground truncate">Escribile una consulta a tu coach</p>
        )}
      </div>

      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
    </motion.button>
  );
};

export default CoachCard;
