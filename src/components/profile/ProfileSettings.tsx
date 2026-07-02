import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, ChevronRight, LogOut, Trash2, ShieldCheck } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { deleteMyAccount } from "@/lib/deleteAccount";
import { useToast } from "@/hooks/use-toast";

const ProfileSettings = () => {
  const { signOut, isAdminMode } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await signOut();
    navigate("/auth");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteMyAccount();
      setShowDeleteConfirm(false);
      toast({ title: "Cuenta eliminada", description: "Se borraron tu cuenta y tus datos." });
      navigate("/auth");
    } catch (e) {
      toast({
        title: "No se pudo eliminar",
        description: e instanceof Error ? e.message : "Intentá de nuevo más tarde.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      className="px-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="accent-bar" />
        <h3 className="text-sm font-black text-foreground tracking-tight">Ajustes</h3>
      </div>

      <div className="space-y-2">
        <motion.button
          className="w-full flex items-center gap-4 p-4 rounded-2xl card-elevated active:opacity-90 transition-opacity text-left"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.65 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/messages")}
        >
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">Soporte con Coach</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </motion.button>

        {/* Política de privacidad */}
        <motion.button
          className="w-full flex items-center gap-4 p-4 rounded-2xl card-elevated active:opacity-90 transition-opacity text-left"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/privacidad")}
        >
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">Política de privacidad</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </motion.button>

        {/* Logout */}
        <motion.button
          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors text-left mt-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.75 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowLogoutConfirm(true)}
        >
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <LogOut className="w-5 h-5 text-red-500" />
          </div>
          <p className="font-semibold text-red-500">Cerrar Sesión</p>
        </motion.button>

        {/* Eliminar cuenta (requisito App Store) — solo para usuarios reales */}
        {!isAdminMode && (
          <button
            className="w-full flex items-center justify-center gap-2 py-3 mt-2 text-sm text-muted-foreground hover:text-red-500 transition-colors"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="w-4 h-4" />
            Eliminar mi cuenta
          </button>
        )}
      </div>

      <ConfirmDialog
        open={showLogoutConfirm}
        title="¿Cerrar sesión?"
        message="Vas a tener que volver a iniciar sesión para entrar."
        confirmLabel="Cerrar sesión"
        cancelLabel="Cancelar"
        destructive
        icon={<LogOut className="w-7 h-7" />}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        title="¿Eliminar tu cuenta?"
        message="Se borrarán tu cuenta y todos tus datos (entrenos, fotos, mediciones, mensajes y progreso) de forma permanente. Esta acción no se puede deshacer."
        confirmLabel={deleting ? "Eliminando…" : "Eliminar definitivamente"}
        cancelLabel="Cancelar"
        destructive
        icon={<Trash2 className="w-7 h-7" />}
        onConfirm={handleDeleteAccount}
        onCancel={() => !deleting && setShowDeleteConfirm(false)}
      />

      <motion.p
        className="text-center text-xs text-muted-foreground mt-8 mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        ELEVATE v1.0.0
      </motion.p>
    </motion.div>
  );
};

export default ProfileSettings;
