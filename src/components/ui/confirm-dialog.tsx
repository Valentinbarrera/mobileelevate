/**
 * Diálogo de confirmación reutilizable (estilo del sistema). Para acciones
 * destructivas o que requieren un "¿estás seguro?".
 */
import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  icon?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  destructive = false,
  icon,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm card-elevated rounded-3xl p-6 text-center"
          initial={{ scale: 0.95, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", stiffness: 340, damping: 26 }}
        >
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
              destructive
                ? "bg-destructive/15 text-destructive"
                : "bg-primary/15 text-primary border border-primary/25"
            }`}
          >
            {icon ?? <AlertTriangle className="w-7 h-7" />}
          </div>
          <h3 className="text-lg font-black text-foreground mb-2">{title}</h3>
          {message && <p className="text-sm text-muted-foreground mb-6">{message}</p>}

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl bg-secondary text-foreground font-bold active:scale-95 transition-transform"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-3 rounded-xl font-bold active:scale-95 transition-transform ${
                destructive
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-gradient-primary text-primary-foreground"
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default ConfirmDialog;
