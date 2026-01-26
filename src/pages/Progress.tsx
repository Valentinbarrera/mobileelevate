import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProgressPhotoUpload from "@/components/progress/ProgressPhotoUpload";
import ProgressComparison from "@/components/progress/ProgressComparison";
import ProgressMetrics from "@/components/progress/ProgressMetrics";
import ProgressHistory from "@/components/progress/ProgressHistory";
import BottomNav from "@/components/home/BottomNav";

export interface ProgressEntry {
  id: string;
  date: string;
  weight: number;
  bodyFat: number;
  frontPhoto?: string;
  sidePhoto?: string;
}

const mockHistory: ProgressEntry[] = [
  {
    id: "1",
    date: "15 de Enero, 2026",
    weight: 78.5,
    bodyFat: 12.4,
    frontPhoto: "📷",
  },
  {
    id: "2",
    date: "1 de Enero, 2026",
    weight: 80.2,
    bodyFat: 14.1,
    frontPhoto: "📷",
  },
];

const Progress = () => {
  const navigate = useNavigate();
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [sidePhoto, setSidePhoto] = useState<string | null>(null);
  const [weight, setWeight] = useState(78.5);
  const [bodyFat, setBodyFat] = useState(12.4);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    // Reset photos after save
    setFrontPhoto(null);
    setSidePhoto(null);
  };

  const lastEntry = mockHistory[0];

  return (
    <motion.div 
      className="min-h-screen bg-background pb-32"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <h1 className="text-lg font-bold text-foreground">Registro de Progreso</h1>
          
          <button className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </motion.header>

      <div className="px-5 pt-6 space-y-8">
        {/* Photo Upload Section */}
        <ProgressPhotoUpload
          frontPhoto={frontPhoto}
          sidePhoto={sidePhoto}
          onFrontPhotoChange={setFrontPhoto}
          onSidePhotoChange={setSidePhoto}
        />

        {/* Previous Comparison */}
        <ProgressComparison lastEntry={lastEntry} />

        {/* Metrics Sliders */}
        <ProgressMetrics
          weight={weight}
          bodyFat={bodyFat}
          onWeightChange={setWeight}
          onBodyFatChange={setBodyFat}
          previousWeight={lastEntry?.weight}
          previousBodyFat={lastEntry?.bodyFat}
        />

        {/* Progress History */}
        <ProgressHistory entries={mockHistory} />
      </div>

      {/* Save Button */}
      <motion.div 
        className="fixed bottom-20 left-0 right-0 p-5 z-40"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none" />
        
        <motion.button
          onClick={handleSave}
          disabled={isSaving}
          className="relative w-full flex items-center justify-center gap-3 bg-gradient-primary rounded-2xl py-5 min-h-[64px] shadow-lg glow-primary disabled:opacity-70"
          whileHover={{ scale: isSaving ? 1 : 1.02 }}
          whileTap={{ scale: isSaving ? 1 : 0.98 }}
        >
          {isSaving ? (
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span className="text-primary-foreground font-bold text-lg">
                GUARDANDO...
              </span>
            </div>
          ) : (
            <span className="text-primary-foreground font-bold text-lg tracking-wide">
              GUARDAR EVOLUCIÓN
            </span>
          )}
        </motion.button>
      </motion.div>

      {/* Bottom Navigation */}
      <BottomNav />
    </motion.div>
  );
};

export default Progress;
