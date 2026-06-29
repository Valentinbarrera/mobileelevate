/**
 * Controles reutilizables del cuestionario de onboarding.
 * Matchean el design system (naranja/negro, card-elevated, accent-bar).
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Minus, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const StepHeader = ({
  title,
  subtitle,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) => (
  <div className="mb-6">
    {eyebrow && (
      <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-2">{eyebrow}</p>
    )}
    <h2 className="text-2xl font-black tracking-tight text-foreground leading-tight">{title}</h2>
    {subtitle && <p className="text-sm text-muted-foreground leading-relaxed mt-1.5">{subtitle}</p>}
  </div>
);

/** Card grande seleccionable (single o multi). */
export const ChoiceCard = ({
  label,
  desc,
  selected,
  onClick,
  icon: Icon,
}: {
  label: string;
  desc?: string;
  selected: boolean;
  onClick: () => void;
  icon?: LucideIcon;
}) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileTap={{ scale: 0.98 }}
    className={`w-full text-left rounded-2xl border p-3.5 flex items-center gap-3 transition-all ${
      selected
        ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
        : "border-border bg-card hover:bg-secondary/40"
    }`}
  >
    {Icon && (
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
          selected ? "bg-primary/20" : "bg-secondary"
        }`}
      >
        <Icon className={`w-5 h-5 ${selected ? "text-primary" : "text-muted-foreground"}`} />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className={`font-bold ${selected ? "text-primary" : "text-foreground"}`}>{label}</p>
      {desc && <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{desc}</p>}
    </div>
    <motion.span
      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
        selected ? "bg-primary border-primary" : "border-muted-foreground/30"
      }`}
      animate={selected ? { scale: [1, 1.25, 1] } : { scale: 1 }}
      transition={{ duration: 0.25 }}
    >
      {selected && <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />}
    </motion.span>
  </motion.button>
);

/** Pill chica para multi-selección (tags). */
export const Chip = ({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileTap={{ scale: 0.95 }}
    className={`px-3.5 py-2 rounded-xl text-sm font-bold border transition-colors ${
      selected
        ? "bg-gradient-primary text-primary-foreground border-transparent"
        : "bg-secondary/50 text-muted-foreground border-white/[0.06]"
    }`}
  >
    {label}
  </motion.button>
);

/**
 * Multi-selección de chips con opción de "+ Agregar otro" (texto libre).
 * Los valores custom (que no están en `options`) se muestran igual como chips.
 */
export const ChipMultiSelect = ({
  options,
  selected,
  onToggle,
  allowCustom = false,
  placeholder = "Escribí otro…",
}: {
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
  allowCustom?: boolean;
  placeholder?: string;
}) => {
  const [custom, setCustom] = useState("");
  const extras = selected.filter((s) => !options.includes(s));

  const addCustom = () => {
    const v = custom.trim();
    if (!v) return;
    if (!selected.includes(v)) onToggle(v);
    setCustom("");
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Chip key={o} label={o} selected={selected.includes(o)} onClick={() => onToggle(o)} />
        ))}
        {extras.map((o) => (
          <Chip key={o} label={o} selected onClick={() => onToggle(o)} />
        ))}
      </div>
      {allowCustom && (
        <div className="flex gap-2">
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            placeholder={placeholder}
            className="flex-1 min-w-0 h-11 rounded-xl bg-card border border-border px-3.5 text-sm text-foreground focus:border-primary focus:outline-none placeholder:text-muted-foreground/40"
          />
          <button
            type="button"
            onClick={addCustom}
            disabled={!custom.trim()}
            className="h-11 px-4 rounded-xl bg-secondary border border-border flex items-center gap-1.5 text-sm font-bold text-foreground disabled:opacity-40 active:scale-95 transition-transform shrink-0"
          >
            <Plus className="w-4 h-4" /> Agregar
          </button>
        </div>
      )}
    </div>
  );
};

/** Input numérico con unidad. */
export const NumberField = ({
  label,
  value,
  onChange,
  unit,
  placeholder = "0",
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  unit?: string;
  placeholder?: string;
}) => (
  <div className="rounded-2xl border border-border bg-card px-4 py-3">
    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
      {label}
    </label>
    <div className="flex items-baseline gap-1.5">
      <input
        type="number"
        inputMode="decimal"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        onFocus={(e) => e.target.select()}
        placeholder={placeholder}
        className="w-full bg-transparent text-2xl font-black tabular-nums text-foreground focus:outline-none placeholder:text-muted-foreground/30"
      />
      {unit && <span className="text-sm font-bold text-muted-foreground shrink-0">{unit}</span>}
    </div>
  </div>
);

/** Stepper +/- para enteros chicos. */
export const Stepper = ({
  label,
  value,
  onChange,
  min = 0,
  max = 99,
  suffix,
}: {
  label: string;
  value: number | null;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
}) => {
  const v = value ?? min;
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3 flex items-center justify-between">
      <span className="text-sm font-bold text-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, v - 1))}
          className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-foreground active:scale-90 transition-transform disabled:opacity-40"
          disabled={v <= min}
          aria-label="Restar"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="min-w-[3.5rem] text-center text-xl font-black tabular-nums text-foreground">
          {value == null ? "—" : `${value}${suffix ? ` ${suffix}` : ""}`}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, v + 1))}
          className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-foreground active:scale-90 transition-transform disabled:opacity-40"
          disabled={v >= max}
          aria-label="Sumar"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/** Textarea con label. */
export const NotesField = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <div className="rounded-2xl border border-border bg-card px-4 py-3">
    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
      {label}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      className="w-full bg-transparent text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/40 resize-none"
    />
  </div>
);
