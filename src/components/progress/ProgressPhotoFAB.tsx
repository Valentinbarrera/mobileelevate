import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProgressPhotoFAB = () => {
  const navigate = useNavigate();

  return (
    <motion.button
      onClick={() => navigate("/progress/upload")}
      className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg flex items-center justify-center glow-primary"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <Camera className="w-6 h-6 text-primary-foreground" />
    </motion.button>
  );
};

export default ProgressPhotoFAB;
