import { motion } from "framer-motion";
import { User } from "lucide-react";

interface ProfileAvatarProps {
  name: string;
  memberType: string;
  memberSince: string;
  avatar: string | null;
}

const ProfileAvatar = ({
  name,
  memberType,
  memberSince,
  avatar,
}: ProfileAvatarProps) => {
  return (
    <motion.div
      className="flex flex-col items-center pt-4 pb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="relative mb-4">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 p-0.5">
          <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      <motion.h2
        className="text-2xl font-black text-foreground mb-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {name}
      </motion.h2>

      <motion.p
        className="text-xs font-bold text-primary uppercase tracking-widest mb-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        {memberType}
      </motion.p>

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
