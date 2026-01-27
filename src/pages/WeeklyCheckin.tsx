import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Camera, Scale, Percent, Battery, Moon, Brain, 
  Zap, Dumbbell, Apple, Trophy, AlertCircle, ChevronRight,
  Check, Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCheckins } from "@/hooks/useCheckins";
import PageContainer from "@/components/ui/page-container";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import type { EnergyLevel, AdherenceLevel, CheckinFormData } from "@/types/checkin";
import { energyLabels, energyEmojis, adherenceLabels, adherenceColors } from "@/types/checkin";

const WeeklyCheckin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { currentCheckin, submitCheckin, loading, getCurrentWeekInfo } = useCheckins();
  
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  
  // Form state
  const [weight, setWeight] = useState<number>(currentCheckin?.weight || 70);
  const [bodyFat, setBodyFat] = useState<number>(currentCheckin?.body_fat_percentage || 20);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>(currentCheckin?.energy_level || 'moderate');
  const [sleepQuality, setSleepQuality] = useState<number>(currentCheckin?.sleep_quality || 3);
  const [stressLevel, setStressLevel] = useState<number>(currentCheckin?.stress_level || 3);
  const [sorenessLevel, setSorenessLevel] = useState<number>(currentCheckin?.soreness_level || 3);
  const [trainingAdherence, setTrainingAdherence] = useState<AdherenceLevel>(currentCheckin?.training_adherence || 'good');
  const [nutritionAdherence, setNutritionAdherence] = useState<AdherenceLevel>(currentCheckin?.nutrition_adherence || 'good');
  const [workoutsCompleted, setWorkoutsCompleted] = useState<number>(currentCheckin?.workouts_completed || 3);
  const [workoutsPlanned, setWorkoutsPlanned] = useState<number>(currentCheckin?.workouts_planned || 4);
  const [wins, setWins] = useState<string>(currentCheckin?.wins || '');
  const [challenges, setChallenges] = useState<string>(currentCheckin?.challenges || '');
  const [notes, setNotes] = useState<string>(currentCheckin?.notes || '');
  
  // Photos
  const [frontPhoto, setFrontPhoto] = useState<File | null>(null);
  const [sidePhoto, setSidePhoto] = useState<File | null>(null);
  const [backPhoto, setBackPhoto] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string>(currentCheckin?.front_photo_url || '');
  const [sidePreview, setSidePreview] = useState<string>(currentCheckin?.side_photo_url || '');
  const [backPreview, setBackPreview] = useState<string>(currentCheckin?.back_photo_url || '');
  
  const frontInputRef = useRef<HTMLInputElement>(null);
  const sideInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);

  // Update form when currentCheckin loads
  useEffect(() => {
    if (currentCheckin) {
      setWeight(currentCheckin.weight || 70);
      setBodyFat(currentCheckin.body_fat_percentage || 20);
      setEnergyLevel(currentCheckin.energy_level);
      setSleepQuality(currentCheckin.sleep_quality || 3);
      setStressLevel(currentCheckin.stress_level || 3);
      setSorenessLevel(currentCheckin.soreness_level || 3);
      setTrainingAdherence(currentCheckin.training_adherence);
      setNutritionAdherence(currentCheckin.nutrition_adherence);
      setWorkoutsCompleted(currentCheckin.workouts_completed);
      setWorkoutsPlanned(currentCheckin.workouts_planned);
      setWins(currentCheckin.wins || '');
      setChallenges(currentCheckin.challenges || '');
      setNotes(currentCheckin.notes || '');
      setFrontPreview(currentCheckin.front_photo_url || '');
      setSidePreview(currentCheckin.side_photo_url || '');
      setBackPreview(currentCheckin.back_photo_url || '');
    }
  }, [currentCheckin]);

  const handlePhotoChange = (type: 'front' | 'side' | 'back', file: File | null) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'front') {
        setFrontPhoto(file);
        setFrontPreview(reader.result as string);
      } else if (type === 'side') {
        setSidePhoto(file);
        setSidePreview(reader.result as string);
      } else {
        setBackPhoto(file);
        setBackPreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Debés iniciar sesión");
      navigate("/auth");
      return;
    }

    setSubmitting(true);
    
    const formData: CheckinFormData = {
      weight,
      body_fat_percentage: bodyFat,
      energy_level: energyLevel,
      sleep_quality: sleepQuality,
      stress_level: stressLevel,
      soreness_level: sorenessLevel,
      training_adherence: trainingAdherence,
      nutrition_adherence: nutritionAdherence,
      workouts_completed: workoutsCompleted,
      workouts_planned: workoutsPlanned,
      wins: wins || undefined,
      challenges: challenges || undefined,
      notes: notes || undefined,
    };

    const photos = {
      front: frontPhoto || undefined,
      side: sidePhoto || undefined,
      back: backPhoto || undefined,
    };

    const result = await submitCheckin(formData, photos);
    setSubmitting(false);

    if (result) {
      navigate("/progress");
    }
  };

  if (authLoading || loading) {
    return (
      <PageContainer className="flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer className="flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Debés iniciar sesión para hacer el check-in</p>
        <Button onClick={() => navigate("/auth")}>Iniciar Sesión</Button>
      </PageContainer>
    );
  }

  const { weekNumber, year } = getCurrentWeekInfo();
  const energyLevels: EnergyLevel[] = ['very_low', 'low', 'moderate', 'high', 'very_high'];
  const adherenceLevels: AdherenceLevel[] = ['poor', 'fair', 'good', 'excellent'];

  return (
    <PageContainer className="pb-safe">
      {/* Header */}
      <motion.div 
        className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4 px-5 py-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Check-in Semanal</h1>
            <p className="text-xs text-muted-foreground">Semana {weekNumber}, {year}</p>
          </div>
          <div className="text-sm font-bold text-primary">
            {step}/{totalSteps}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </motion.div>

      <div className="px-5 py-6">
        {/* Step 1: Photos */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <Camera className="w-12 h-12 text-primary mx-auto mb-3" />
              <h2 className="text-xl font-bold text-foreground">Fotos de Progreso</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Capturá tu evolución visual (opcional)
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Front Photo */}
              <div>
                <input
                  ref={frontInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePhotoChange('front', e.target.files?.[0] || null)}
                />
                <button
                  onClick={() => frontInputRef.current?.click()}
                  className={`w-full aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                    frontPreview ? 'border-primary' : 'border-border hover:border-primary/50'
                  }`}
                >
                  {frontPreview ? (
                    <img src={frontPreview} alt="Frente" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <>
                      <Camera className="w-6 h-6 text-muted-foreground mb-2" />
                      <span className="text-xs text-muted-foreground">Frente</span>
                    </>
                  )}
                </button>
              </div>

              {/* Side Photo */}
              <div>
                <input
                  ref={sideInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePhotoChange('side', e.target.files?.[0] || null)}
                />
                <button
                  onClick={() => sideInputRef.current?.click()}
                  className={`w-full aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                    sidePreview ? 'border-primary' : 'border-border hover:border-primary/50'
                  }`}
                >
                  {sidePreview ? (
                    <img src={sidePreview} alt="Perfil" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <>
                      <Camera className="w-6 h-6 text-muted-foreground mb-2" />
                      <span className="text-xs text-muted-foreground">Perfil</span>
                    </>
                  )}
                </button>
              </div>

              {/* Back Photo */}
              <div>
                <input
                  ref={backInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePhotoChange('back', e.target.files?.[0] || null)}
                />
                <button
                  onClick={() => backInputRef.current?.click()}
                  className={`w-full aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                    backPreview ? 'border-primary' : 'border-border hover:border-primary/50'
                  }`}
                >
                  {backPreview ? (
                    <img src={backPreview} alt="Espalda" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <>
                      <Camera className="w-6 h-6 text-muted-foreground mb-2" />
                      <span className="text-xs text-muted-foreground">Espalda</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Weight & Body Fat */}
            <div className="space-y-4 mt-8">
              <div className="p-4 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <Scale className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-semibold text-foreground">Peso</span>
                  <span className="ml-auto text-xl font-black text-foreground">{weight} kg</span>
                </div>
                <Slider
                  value={[weight]}
                  onValueChange={([v]) => setWeight(v)}
                  min={40}
                  max={150}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <Percent className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Grasa Corporal</span>
                  <span className="ml-auto text-xl font-black text-foreground">{bodyFat}%</span>
                </div>
                <Slider
                  value={[bodyFat]}
                  onValueChange={([v]) => setBodyFat(v)}
                  min={5}
                  max={50}
                  step={0.5}
                  className="w-full"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Energy & Wellness */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <Battery className="w-12 h-12 text-primary mx-auto mb-3" />
              <h2 className="text-xl font-bold text-foreground">Estado General</h2>
              <p className="text-sm text-muted-foreground mt-1">
                ¿Cómo te sentiste esta semana?
              </p>
            </div>

            {/* Energy Level */}
            <div className="p-4 rounded-2xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-semibold text-foreground">Nivel de Energía</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {energyLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setEnergyLevel(level)}
                    className={`py-3 rounded-xl text-center transition-all ${
                      energyLevel === level
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    <span className="text-xl block mb-1">{energyEmojis[level]}</span>
                    <span className="text-[10px] font-semibold">{energyLabels[level]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sleep Quality */}
            <div className="p-4 rounded-2xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Moon className="w-5 h-5 text-indigo-500" />
                <span className="text-sm font-semibold text-foreground">Calidad de Sueño</span>
                <span className="ml-auto text-lg font-bold text-foreground">{sleepQuality}/5</span>
              </div>
              <Slider
                value={[sleepQuality]}
                onValueChange={([v]) => setSleepQuality(v)}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
            </div>

            {/* Stress Level */}
            <div className="p-4 rounded-2xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-semibold text-foreground">Nivel de Estrés</span>
                <span className="ml-auto text-lg font-bold text-foreground">{stressLevel}/5</span>
              </div>
              <Slider
                value={[stressLevel]}
                onValueChange={([v]) => setStressLevel(v)}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
            </div>

            {/* Soreness Level */}
            <div className="p-4 rounded-2xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm font-semibold text-foreground">Dolor Muscular</span>
                <span className="ml-auto text-lg font-bold text-foreground">{sorenessLevel}/5</span>
              </div>
              <Slider
                value={[sorenessLevel]}
                onValueChange={([v]) => setSorenessLevel(v)}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
            </div>
          </motion.div>
        )}

        {/* Step 3: Adherence */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <Check className="w-12 h-12 text-primary mx-auto mb-3" />
              <h2 className="text-xl font-bold text-foreground">Adherencia</h2>
              <p className="text-sm text-muted-foreground mt-1">
                ¿Qué tan bien seguiste el plan?
              </p>
            </div>

            {/* Workouts Completed */}
            <div className="p-4 rounded-2xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Dumbbell className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-semibold text-foreground">Entrenamientos</span>
                <span className="ml-auto text-lg font-bold text-foreground">
                  {workoutsCompleted}/{workoutsPlanned}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-2">Completados</label>
                  <Slider
                    value={[workoutsCompleted]}
                    onValueChange={([v]) => setWorkoutsCompleted(v)}
                    min={0}
                    max={7}
                    step={1}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-2">Planificados</label>
                  <Slider
                    value={[workoutsPlanned]}
                    onValueChange={([v]) => setWorkoutsPlanned(v)}
                    min={1}
                    max={7}
                    step={1}
                  />
                </div>
              </div>
            </div>

            {/* Training Adherence */}
            <div className="p-4 rounded-2xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Dumbbell className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-foreground">Adherencia al Entrenamiento</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {adherenceLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setTrainingAdherence(level)}
                    className={`py-3 px-2 rounded-xl text-center transition-all text-xs font-bold ${
                      trainingAdherence === level
                        ? adherenceColors[level]
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {adherenceLabels[level]}
                  </button>
                ))}
              </div>
            </div>

            {/* Nutrition Adherence */}
            <div className="p-4 rounded-2xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Apple className="w-5 h-5 text-green-500" />
                <span className="text-sm font-semibold text-foreground">Adherencia a la Nutrición</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {adherenceLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setNutritionAdherence(level)}
                    className={`py-3 px-2 rounded-xl text-center transition-all text-xs font-bold ${
                      nutritionAdherence === level
                        ? adherenceColors[level]
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {adherenceLabels[level]}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Reflections */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <Trophy className="w-12 h-12 text-primary mx-auto mb-3" />
              <h2 className="text-xl font-bold text-foreground">Reflexiones</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Contale al coach cómo te fue
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wider block mb-2">
                  🏆 Logros de la Semana
                </label>
                <Textarea
                  value={wins}
                  onChange={(e) => setWins(e.target.value)}
                  placeholder="¿Qué hiciste bien esta semana? ¿Qué lograste?"
                  className="min-h-[100px] rounded-2xl bg-card border-border"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wider block mb-2">
                  ⚡ Desafíos Enfrentados
                </label>
                <Textarea
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  placeholder="¿Qué te costó? ¿Qué obstáculos tuviste?"
                  className="min-h-[100px] rounded-2xl bg-card border-border"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wider block mb-2">
                  💬 Notas Adicionales
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="¿Algo más que quieras compartir con tu coach?"
                  className="min-h-[80px] rounded-2xl bg-card border-border"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-background/95 backdrop-blur-lg border-t border-border pb-safe">
        <div className="flex gap-3">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="flex-1 h-14 rounded-2xl"
            >
              Anterior
            </Button>
          )}
          
          {step < totalSteps ? (
            <Button
              onClick={() => setStep(step + 1)}
              className="flex-1 h-14 rounded-2xl bg-gradient-primary text-primary-foreground font-bold"
            >
              Siguiente
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 h-14 rounded-2xl bg-gradient-primary text-primary-foreground font-bold glow-primary"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Enviar Check-in
                  <Check className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default WeeklyCheckin;
