import { motion } from "framer-motion";
import { Crown } from "lucide-react";

interface ProfileAvatarProps {
  name: string;
  memberType: string;
  memberSince: string;
  avatar: string;
  isPro: boolean;
}

const ProfileAvatar = ({ 
  name, 
  memberType, 
  memberSince, 
  avatar, 
  isPro 
}: ProfileAvatarProps) => {
  return (
    <motion.div 
      className="flex flex-col items-center pt-4 pb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {/* Avatar Container */}
      <div className="relative mb-4">
        {/* Avatar Ring */}
        <div className="relative">
          <motion.div 
            className="w-28 h-28 rounded-full bg-gradient-to-br from-primary via-amber-500 to-primary p-1"
            animate={{ 
              boxShadow: [
                "0 0 20px hsla(var(--primary), 0.3)",
                "0 0 40px hsla(var(--primary), 0.5)",
                "0 0 20px hsla(var(--primary), 0.3)",
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-5xl overflow-hidden">
              {avatar.startsWith('http') ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                avatar
              )}
            </div>
          </motion.div>
          
          {/* PRO Badge */}
          {isPro && (
            <motion.div 
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-amber-500 flex items-center gap-1 shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <Crown className="w-3 h-3 text-white" />
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">PRO</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Name */}
      <motion.h2 
        className="text-2xl font-black text-foreground mb-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {name.toUpperCase()}
      </motion.h2>

      {/* Member Type */}
      <motion.p 
        className="text-xs font-bold text-primary uppercase tracking-widest mb-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        {memberType}
      </motion.p>

      {/* Member Since */}
      <motion.p 
        className="text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {memberSince}
      </motion.p>
    </motion.div>
  );
};

export default ProfileAvatar;
