import { motion } from "framer-motion";
import { User, Bell, Link2, HeadphonesIcon, ChevronRight, LogOut, Shield } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface SettingItem {
  icon: React.ElementType;
  label: string;
  sublabel?: string;
  isConnected?: boolean;
  hasChevron?: boolean;
}

const settingsItems: SettingItem[] = [
  { icon: User, label: "Configuración de Cuenta", hasChevron: true },
  { icon: Bell, label: "Notificaciones", hasChevron: true },
  { icon: Link2, label: "Apple Health / Strava", sublabel: "VINCULADO", isConnected: true, hasChevron: true },
  { icon: HeadphonesIcon, label: "Soporte con Coach", hasChevron: true },
  { icon: Shield, label: "Privacidad y Seguridad", hasChevron: true },
];

const ProfileSettings = () => {
  const { signOut } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
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
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Ajustes & Configuración
      </h3>

      <div className="space-y-2">
        {settingsItems.map((item, index) => (
          <motion.button
            key={item.label}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:bg-card/80 transition-colors text-left"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.65 + index * 0.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <item.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">{item.label}</p>
              {item.sublabel && (
                <p className={`text-xs font-semibold mt-0.5 ${item.isConnected ? "text-emerald-500" : "text-muted-foreground"}`}>
                  {item.sublabel}
                </p>
              )}
            </div>
            {item.hasChevron && <ChevronRight className="w-5 h-5 text-muted-foreground" />}
          </motion.button>
        ))}

        {/* Logout Button */}
        <motion.button
          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors text-left mt-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
        >
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <LogOut className="w-5 h-5 text-red-500" />
          </div>
          <p className="font-semibold text-red-500">Cerrar Sesión</p>
        </motion.button>
      </div>

      <motion.p 
        className="text-center text-xs text-muted-foreground mt-8 mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        ELEVATE v2.4.1 • Made with 💪
      </motion.p>
    </motion.div>
  );
};

export default ProfileSettings;
