/**
 * Disclaimer + citas de fuentes para las pantallas de nutrición.
 *
 * Requisito App Store Guideline 1.4.1 (Safety - Physical Harm): toda app con
 * información de salud/nutrición debe incluir citas a fuentes fáciles de encontrar
 * y aclarar que no reemplaza el consejo médico profesional.
 */
import { Info, ExternalLink } from "lucide-react";

const SOURCES: { label: string; url: string }[] = [
  {
    label: "OMS — Alimentación sana",
    url: "https://www.who.int/es/news-room/fact-sheets/detail/healthy-diet",
  },
  {
    label: "Guías Alimentarias para la Población Argentina (MSAL)",
    url: "https://www.argentina.gob.ar/salud/alimentacion-saludable/guias",
  },
  {
    label: "FAO — Guías alimentarias basadas en alimentos",
    url: "https://www.fao.org/nutrition/educacion-nutricional/food-dietary-guidelines/es/",
  },
];

const NutritionDisclaimer = () => (
  <div className="rounded-2xl bg-secondary/40 border border-white/[0.06] px-4 py-3.5">
    <div className="flex items-start gap-2.5">
      <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Los planes y recomendaciones de esta sección son orientativos y los personaliza tu coach.
          No sustituyen la consulta con un médico o nutricionista matriculado. Ante cualquier
          condición de salud, consultá a un profesional antes de cambiar tu alimentación.
        </p>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-3 mb-1.5">
          Fuentes
        </p>
        <ul className="space-y-1.5">
          {SOURCES.map((s) => (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary active:opacity-70"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                <span className="underline underline-offset-2">{s.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

export default NutritionDisclaimer;
