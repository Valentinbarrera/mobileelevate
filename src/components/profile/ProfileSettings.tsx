import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, ChevronRight, LogOut } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "@/components/ui/confirm-dialog";

const ProfileSettings = () => {
  const { signOut } = useAuthContext();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await signOut();
    navigate("/auth");
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
