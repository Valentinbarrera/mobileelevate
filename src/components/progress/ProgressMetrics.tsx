import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface ProgressMetricsProps {
  weight: number;
  bodyFat: number;
  onWeightChange: (value: number) => void;
  onBodyFatChange: (value: number) => void;
  previousWeight?: number;
  previousBodyFat?: number;
}

const ProgressMetrics = ({
  weight,
  bodyFat,
  onWeightChange,
  onBodyFatChange,
  previousWeight,
  previousBodyFat,
}: ProgressMetricsProps) => {
  const weightDiff = previousWeight ? weight - previousWeight : 0;
  const bodyFatDiff = previousBodyFat ? bodyFat - previousBodyFat : 0;

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Weight Slider */}
      <MetricSlider
        label="PESO ACTUAL"
        value={weight}
        min={40}
        max={150}
        step={0.1}
        unit="kg"
        onChange={onWeightChange}
        diff={weightDiff}
        diffInverted={true} // Lower is usually better for weight
      />

      {/* Body Fat Slider */}
      <MetricSlider
        label="% GRASA CORPORAL"
        value={bodyFat}
        min={3}
        max={40}
        step={0.1}
        unit="%"
        onChange={onBodyFatChange}
        diff={bodyFatDiff}
        diffInverted={true} // Lower is usually better for body fat
      />
    </motion.div>
  );
};

interface MetricSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
  diff?: number;
  diffInverted?: boolean;
}

const MetricSlider = ({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  diff = 0,
  diffInverted = false,
}: MetricSliderProps) => {
  const isPositive = diffInverted ? diff < 0 : diff > 0;
  const isNegative = diffInverted ? diff > 0 : diff < 0;
  const TrendIcon = diff === 0 ? Minus : isPositive ? TrendingUp : TrendingDown;
  const trendColor = diff === 0 ? "text-muted-foreground" : isPositive ? "text-emerald-500" : "text-red-500";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        
        <div className="flex items-center gap-2">
          <span className="text-3xl font-black text-foreground tabular-nums">
            {value.toFixed(1)}
          </span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
      </div>

      {/* Custom styled slider */}
      <div className="relative">
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={([v]) => onChange(v)}
          className="w-full"
        />
      </div>

      {/* Trend indicator */}
      {diff !== 0 && (
        <motion.div 
          className={`flex items-center gap-1.5 ${trendColor}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <TrendIcon className="w-4 h-4" />
          <span className="text-xs font-semibold">
            {Math.abs(diff).toFixed(1)} {unit} vs anterior
          </span>
        </motion.div>
      )}
    </div>
  );
};

export default ProgressMetrics;
