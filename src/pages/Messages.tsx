import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import BottomNav from '@/components/home/BottomNav';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, MessageCircle, ArrowLeft, Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { staggerContainer, fadeUp } from '@/lib/animations';

export default function Messages() {
  const navigate = useNavigate();
  const { student } = useAuthContext();
  const queryClient = useQueryClient();
  const [messageText, setMessageText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useQuery({
    queryKey: ['student-messages', student?.id],
    queryFn: async () => {
      if (!student?.id) return [];
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('student_id', student.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!student?.id,
    refetchInterval: 10000,
  });

  // Mark coach messages as seen when they appear
  const markAsSeen = useCallback(async () => {
    if (!student?.id || !messages?.length) return;

    const unseenCoachMessages = messages.filter(
      (msg: any) => msg.sender === 'coach' && !msg.seen_at
    );

    if (unseenCoachMessages.length === 0) return;

    const ids = unseenCoachMessages.map((msg: any) => msg.id);
    const now = new Date().toISOString();

    const { error } = await supabase
      .from('messages')
      .update({ seen_at: now })
      .in('id', ids);

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['student-messages'] });
    }
  }, [student?.id, messages, queryClient]);

  // Mark as seen when messages load or change
  useEffect(() => {
    markAsSeen();
  }, [markAsSeen]);

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!student?.id || !student?.coach_id) throw new Error('No student');
      const { error } = await supabase.from('messages').insert({
        student_id: student.id,
        coach_id: student.coach_id,
        content,
        sender: 'student',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-messages'] });
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!messageText.trim() || sendMessage.isPending) return;
    await sendMessage.mutateAsync(messageText.trim());
    setMessageText('');
  };

  const formatTime = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return 'Ayer ' + format(date, 'HH:mm');
    return format(date, 'd MMM HH:mm', { locale: es });
  };

  // Count unseen coach messages for header badge
  const unseenCount = (messages || []).filter(
    (msg: any) => msg.sender === 'coach' && !msg.seen_at
  ).length;

  return (
    <motion.div
      className="min-h-screen bg-background flex flex-col pb-28"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Mensajes</h1>
          {unseenCount > 0 && (
            <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unseenCount}
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3" ref={scrollRef}>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !messages || messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <MessageCircle className="w-14 h-14 text-muted-foreground/30 mb-4" />
            <p className="font-semibold text-foreground mb-1">No hay mensajes aún</p>
            <p className="text-sm text-muted-foreground">Inicia una conversación con tu coach</p>
          </div>
        ) : (
          messages.map((msg: any) => {
            const isStudent = msg.sender === 'student';
            return (
              <div key={msg.id} className={cn("flex", isStudent ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3",
                  isStudent
                    ? "bg-primary text-white rounded-br-sm"
                    : "bg-card text-foreground border border-border/50 rounded-bl-sm"
                )}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <div className={cn("flex items-center gap-1 mt-1", isStudent ? "justify-end" : "")}>
                    <p className={cn("text-xs", isStudent ? "text-white/70" : "text-muted-foreground")}>
                      {formatTime(msg.created_at)}
                    </p>
                    {/* Read receipts for student's own messages */}
                    {isStudent && (
                      msg.seen_at ? (
                        <CheckCheck className="w-3.5 h-3.5 text-white/70" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-white/50" />
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="sticky bottom-28 bg-background border-t border-border/50 px-5 py-3">
        <div className="flex items-end gap-2">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Escribe un mensaje..."
            className="rounded-xl flex-1 min-h-[44px]"
            disabled={sendMessage.isPending}
          />
          <Button
            onClick={handleSend}
            disabled={!messageText.trim() || sendMessage.isPending}
            size="icon"
            className="rounded-xl h-11 w-11"
          >
            {sendMessage.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      <BottomNav />
    </motion.div>
  );
}
