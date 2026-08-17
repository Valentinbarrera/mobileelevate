/**
 * Módulo Evaluaciones — catálogo de variables antropométricas.
 *
 * Cada campo de este catálogo es, al mismo tiempo:
 *  - una columna de `anthropometry_measurements` (el `id` es el nombre de la columna),
 *  - una fila en la pantalla de revisión,
 *  - y un conjunto de alias para reconocerlo dentro del informe.
 *
 * Agregar una variable nueva = agregar una entrada acá + su columna en la tabla
 * (ver `scripts/setup-evaluations.sql`). Si todavía no tiene columna, el parser
 * la guarda en `extra_data`.
 *
 * Los alias están calibrados contra informes reales de **fraccionamiento de 5
 * masas (Kerr, 1988) con protocolo ISAK**, que es lo que usan los
 * antropometristas en Argentina.
 */

export type EvaluationType = 'anthropometry';

export type FieldGroup =
  | 'general'
  | 'composition'
  | 'indices'
  | 'skinfolds'
  | 'circumferences'
  | 'breadths';

export const GROUP_LABELS: Record<FieldGroup, string> = {
  general: 'Datos generales',
  composition: 'Composición corporal',
  indices: 'Índices',
  skinfolds: 'Pliegues',
  circumferences: 'Perímetros',
  breadths: 'Diámetros',
};

/** Orden en el que se muestran las secciones en la revisión. */
export const GROUP_ORDER: FieldGroup[] = [
  'general',
  'composition',
  'indices',
  'skinfolds',
  'circumferences',
  'breadths',
];

export interface AnthropometryField {
  /** Nombre de la columna en `anthropometry_measurements`. */
  id: string;
  label: string;
  group: FieldGroup;
  unit: 'kg' | 'cm' | 'mm' | '%' | 'años' | 'kcal' | null;
  /** Alias que pueden aparecer como etiqueta en el informe (se normalizan en runtime). */
  aliases: string[];
  type?: 'number' | 'text';
  /** Rango razonable — fuera de rango se avisa, pero no bloquea el guardado. */
  min?: number;
  max?: number;
  decimals?: number;
  /** Se muestra en las tarjetas de resumen / comparación. */
  key?: boolean;
}

export const ANTHROPOMETRY_FIELDS: AnthropometryField[] = [
  // ---------------------------------------------------------------
  // Datos generales
  // ---------------------------------------------------------------
  {
    id: 'weight',
    label: 'Peso',
    group: 'general',
    unit: 'kg',
    key: true,
    min: 20,
    max: 300,
    decimals: 1,
    aliases: ['peso', 'peso corporal', 'peso actual', 'masa corporal', 'body weight', 'weight'],
  },
  {
    id: 'height',
    label: 'Altura',
    group: 'general',
    unit: 'cm',
    min: 100,
    max: 230,
    decimals: 1,
    aliases: ['altura', 'talla', 'estatura', 'height', 'estatura de pie', 'talla de pie'],
  },
  {
    id: 'sitting_height',
    label: 'Talla sentado',
    group: 'general',
    unit: 'cm',
    min: 50,
    max: 130,
    decimals: 1,
    // Va antes que 'talla' por ser un alias más largo: si no, se lo comería `height`.
    aliases: ['talla sentado', 'altura sentado', 'sitting height'],
  },
  {
    id: 'age',
    label: 'Edad',
    group: 'general',
    unit: 'años',
    min: 5,
    max: 100,
    decimals: 0,
    aliases: ['edad', 'age', 'edad decimal', 'edad cronologica'],
  },
  {
    id: 'sex',
    label: 'Sexo',
    group: 'general',
    unit: null,
    type: 'text',
    aliases: ['sexo', 'genero', 'sex', 'gender'],
  },

  // ---------------------------------------------------------------
  // Composición corporal
  // ---------------------------------------------------------------
  {
    id: 'muscle_mass',
    label: 'Masa muscular',
    group: 'composition',
    unit: 'kg',
    key: true,
    min: 5,
    max: 100,
    decimals: 1,
    aliases: [
      'masa muscular',
      'masa musculo esqueletica',
      'muscular',
      'musculo',
      'muscle mass',
      'masa magra muscular',
    ],
  },
  {
    id: 'fat_mass',
    label: 'Masa adiposa',
    group: 'composition',
    unit: 'kg',
    key: true,
    min: 1,
    max: 150,
    decimals: 1,
    aliases: ['masa adiposa', 'masa grasa', 'adiposa', 'fat mass', 'grasa kg', 'masa de grasa'],
  },
  {
    id: 'bone_mass',
    label: 'Masa ósea',
    group: 'composition',
    unit: 'kg',
    min: 0.5,
    max: 20,
    decimals: 1,
    aliases: ['masa osea', 'osea', 'bone mass', 'masa esqueletica'],
  },
  {
    id: 'residual_mass',
    label: 'Masa residual',
    group: 'composition',
    unit: 'kg',
    min: 1,
    max: 60,
    decimals: 1,
    aliases: ['masa residual', 'residual', 'residual mass'],
  },
  {
    id: 'skin_mass',
    label: 'Masa piel',
    group: 'composition',
    unit: 'kg',
    min: 0.5,
    max: 15,
    decimals: 1,
    aliases: ['masa piel', 'masa de piel', 'piel', 'skin mass'],
  },
  {
    id: 'total_body_mass',
    label: 'Masa corporal total',
    group: 'composition',
    unit: 'kg',
    min: 20,
    max: 300,
    decimals: 1,
    aliases: [
      'masa corporal total',
      'masa total',
      'peso total',
      'total body mass',
      'sumatoria de masas',
    ],
  },
  {
    id: 'body_fat_percentage',
    label: '% Grasa corporal',
    group: 'composition',
    unit: '%',
    key: true,
    min: 1,
    max: 70,
    decimals: 1,
    aliases: [
      'grasa corporal',
      'porcentaje de grasa',
      'porcentaje graso',
      'grasa',
      'body fat',
      'body fat percentage',
      'tejido adiposo',
    ],
  },
  {
    id: 'muscle_percentage',
    label: '% Masa muscular',
    group: 'composition',
    unit: '%',
    min: 10,
    max: 80,
    decimals: 1,
    aliases: [
      'porcentaje muscular',
      'porcentaje de musculo',
      'porcentaje de masa muscular',
      'muscle percentage',
    ],
  },

  // ---------------------------------------------------------------
  // Índices
  // ---------------------------------------------------------------
  {
    id: 'bmi',
    label: 'IMC',
    group: 'indices',
    unit: null,
    min: 10,
    max: 60,
    decimals: 2,
    aliases: [
      'imc',
      'bmi',
      'indice de masa corporal',
      'indice masa corporal',
      'body mass index',
    ],
  },
  {
    id: 'adipose_muscle_index',
    label: 'Índice adiposo/muscular',
    group: 'indices',
    unit: null,
    min: 0.1,
    max: 5,
    decimals: 2,
    aliases: ['indice adiposo muscular', 'relacion adiposo muscular', 'indice adiposo'],
  },
  {
    id: 'bone_mass_index',
    label: 'IMO (índice de masa ósea)',
    group: 'indices',
    unit: null,
    key: true,
    min: 1,
    max: 10,
    decimals: 2,
    aliases: ['imo', 'indice de masa osea', 'indice masa osea', 'bone mass index'],
  },
  {
    id: 'muscle_bone_index',
    label: 'Índice músculo-óseo',
    group: 'indices',
    unit: null,
    min: 1,
    max: 10,
    decimals: 2,
    aliases: [
      'indice musculo oseo',
      'indice musculo-oseo',
      'indice m o',
      'im o',
      'muscle bone index',
      'relacion musculo osea',
    ],
  },
  {
    id: 'projected_weight',
    label: 'Peso proyectado',
    group: 'indices',
    unit: 'kg',
    min: 20,
    max: 300,
    decimals: 2,
    aliases: [
      'peso proyectado',
      'peso ideal',
      'peso objetivo',
      'peso estimado',
      'projected weight',
    ],
  },
  {
    id: 'waist_hip_ratio',
    label: 'Índice cintura/cadera',
    group: 'indices',
    unit: null,
    min: 0.4,
    max: 1.5,
    decimals: 2,
    aliases: [
      'indice cintura cadera',
      'relacion cintura cadera',
      'cintura cadera',
      'waist hip ratio',
      'icc',
    ],
  },
  {
    id: 'basal_metabolism',
    label: 'Metabolismo basal',
    group: 'indices',
    unit: 'kcal',
    min: 500,
    max: 4000,
    decimals: 0,
    aliases: ['metabolismo basal', 'tasa metabolica basal', 'basal metabolism', 'tmb'],
  },
  {
    id: 'energy_expenditure',
    label: 'Gasto energético total',
    group: 'indices',
    unit: 'kcal',
    min: 800,
    max: 8000,
    decimals: 0,
    aliases: [
      'gasto energetico total estimado',
      'gasto energetico total',
      'gasto energetico',
      'total energy expenditure',
    ],
  },
  {
    id: 'somatotype_endo',
    label: 'Endomorfia',
    group: 'indices',
    unit: null,
    min: 0.1,
    max: 16,
    decimals: 1,
    aliases: ['endo', 'endomorfia', 'endomorfo'],
  },
  {
    id: 'somatotype_meso',
    label: 'Mesomorfia',
    group: 'indices',
    unit: null,
    min: 0.1,
    max: 16,
    decimals: 1,
    aliases: ['meso', 'mesomorfia', 'mesomorfo'],
  },
  {
    id: 'somatotype_ecto',
    label: 'Ectomorfia',
    group: 'indices',
    unit: null,
    min: 0.1,
    max: 16,
    decimals: 1,
    aliases: ['ecto', 'ectomorfia', 'ectomorfo'],
  },

  // ---------------------------------------------------------------
  // Pliegues (mm)
  // ---------------------------------------------------------------
  {
    id: 'triceps_skinfold',
    label: 'Tríceps',
    group: 'skinfolds',
    unit: 'mm',
    min: 1,
    max: 60,
    decimals: 1,
    aliases: ['triceps', 'pliegue triceps', 'pliegue tricipital', 'triceps skinfold'],
  },
  {
    id: 'subscapular_skinfold',
    label: 'Subescapular',
    group: 'skinfolds',
    unit: 'mm',
    min: 1,
    max: 60,
    decimals: 1,
    aliases: ['subescapular', 'pliegue subescapular', 'subscapular'],
  },
  {
    id: 'biceps_skinfold',
    label: 'Bíceps',
    group: 'skinfolds',
    unit: 'mm',
    min: 1,
    max: 60,
    decimals: 1,
    aliases: ['biceps', 'pliegue biceps', 'pliegue bicipital', 'biceps skinfold'],
  },
  {
    id: 'iliac_crest_skinfold',
    label: 'Cresta ilíaca',
    group: 'skinfolds',
    unit: 'mm',
    min: 1,
    max: 70,
    decimals: 1,
    aliases: ['cresta iliaca', 'pliegue cresta iliaca', 'iliac crest', 'suprailiaco', 'suprailiaca'],
  },
  {
    id: 'supraspinale_skinfold',
    label: 'Supraespinal',
    group: 'skinfolds',
    unit: 'mm',
    min: 1,
    max: 60,
    decimals: 1,
    aliases: ['supraespinal', 'pliegue supraespinal', 'supraespinale', 'supraspinale'],
  },
  {
    id: 'abdominal_skinfold',
    label: 'Abdominal',
    group: 'skinfolds',
    unit: 'mm',
    min: 1,
    max: 70,
    decimals: 1,
    aliases: ['abdominal', 'pliegue abdominal', 'abdomen', 'abdominal skinfold'],
  },
  {
    id: 'thigh_skinfold',
    label: 'Muslo',
    group: 'skinfolds',
    unit: 'mm',
    min: 1,
    max: 70,
    decimals: 1,
    // 'muslo' y 'pantorrilla' sueltos son ambiguos (pliegue vs perímetro):
    // los desambigua el encabezado de sección o la unidad de la etiqueta.
    aliases: [
      'pliegue muslo',
      'pliegue muslo frontal',
      'muslo frontal',
      'muslo medial',
      'thigh skinfold',
      'muslo',
    ],
  },
  {
    id: 'calf_skinfold',
    label: 'Pantorrilla',
    group: 'skinfolds',
    unit: 'mm',
    min: 1,
    max: 60,
    decimals: 1,
    aliases: [
      'pliegue pantorrilla',
      'pliegue pierna',
      'pantorrilla medial',
      'pierna medial',
      'calf skinfold',
      'pantorrilla',
    ],
  },
  {
    id: 'sum_6_skinfolds',
    label: 'Suma de 6 pliegues',
    group: 'skinfolds',
    unit: 'mm',
    key: true,
    min: 20,
    max: 400,
    decimals: 1,
    aliases: [
      'suma de 6 pliegues',
      'sumatoria de 6 pliegues',
      'sumatoria de pliegues',
      'suma de pliegues',
      'sum of 6 skinfolds',
    ],
  },
  {
    id: 'sum_8_skinfolds',
    label: 'Suma de 8 pliegues',
    group: 'skinfolds',
    unit: 'mm',
    min: 30,
    max: 500,
    decimals: 1,
    aliases: ['suma de 8 pliegues', 'sumatoria de 8 pliegues', 'sum of 8 skinfolds'],
  },

  // ---------------------------------------------------------------
  // Perímetros (cm)
  // ---------------------------------------------------------------
  {
    id: 'relaxed_arm_circumference',
    label: 'Brazo relajado',
    group: 'circumferences',
    unit: 'cm',
    min: 15,
    max: 70,
    decimals: 1,
    aliases: [
      'brazo relajado',
      'perimetro brazo relajado',
      'brazo en reposo',
      'relaxed arm',
      'brazo',
    ],
  },
  {
    id: 'flexed_arm_circumference',
    label: 'Brazo contraído',
    group: 'circumferences',
    unit: 'cm',
    min: 15,
    max: 70,
    decimals: 1,
    aliases: [
      'brazo contraido',
      'brazo flexionado',
      'perimetro brazo contraido',
      'brazo tenso',
      'flexed arm',
    ],
  },
  {
    id: 'waist_circumference',
    label: 'Cintura',
    group: 'circumferences',
    unit: 'cm',
    key: true,
    min: 40,
    max: 200,
    decimals: 1,
    aliases: ['cintura', 'perimetro cintura', 'circunferencia cintura', 'waist'],
  },
  {
    id: 'hip_circumference',
    label: 'Cadera',
    group: 'circumferences',
    unit: 'cm',
    min: 50,
    max: 200,
    decimals: 1,
    aliases: [
      'cadera',
      'caderas',
      'caderas maxima',
      'perimetro cadera',
      'circunferencia cadera',
      'gluteo',
      'hip',
    ],
  },
  {
    id: 'forearm_circumference',
    label: 'Antebrazo',
    group: 'circumferences',
    unit: 'cm',
    min: 15,
    max: 45,
    decimals: 1,
    aliases: ['antebrazo', 'perimetro antebrazo', 'forearm'],
  },
  {
    id: 'head_circumference',
    label: 'Cabeza',
    group: 'circumferences',
    unit: 'cm',
    min: 40,
    max: 70,
    decimals: 1,
    aliases: ['cabeza', 'perimetro cabeza', 'head circumference'],
  },
  {
    id: 'upper_thigh_circumference',
    label: 'Muslo superior',
    group: 'circumferences',
    unit: 'cm',
    min: 30,
    max: 110,
    decimals: 1,
    // Alias más largo que 'muslo', así no compite con el pliegue ni con el muslo medial.
    aliases: ['muslo superior', 'perimetro muslo superior', 'upper thigh'],
  },
  {
    id: 'thigh_circumference',
    label: 'Muslo',
    group: 'circumferences',
    unit: 'cm',
    min: 30,
    max: 100,
    decimals: 1,
    aliases: [
      'perimetro muslo',
      'circunferencia muslo',
      'muslo medio',
      // "Muslo (medial)" es a la vez pliegue y perímetro en el proforma ISAK:
      // lo declaramos en ambos y desempata la sección del informe.
      'muslo medial',
      'thigh circumference',
      'muslo',
    ],
  },
  {
    id: 'calf_circumference',
    label: 'Pantorrilla',
    group: 'circumferences',
    unit: 'cm',
    min: 20,
    max: 70,
    decimals: 1,
    aliases: [
      'perimetro pantorrilla',
      'circunferencia pantorrilla',
      'perimetro pierna',
      'pantorrilla maxima',
      'calf circumference',
      'pantorrilla',
    ],
  },
  {
    id: 'chest_circumference',
    label: 'Tórax',
    group: 'circumferences',
    unit: 'cm',
    min: 50,
    max: 180,
    decimals: 1,
    aliases: [
      'torax mesoesternal',
      'perimetro torax',
      'perimetro pecho',
      'torax',
      'pecho',
      'chest',
    ],
  },

  // ---------------------------------------------------------------
  // Diámetros (cm)
  // ---------------------------------------------------------------
  {
    id: 'humerus_breadth',
    label: 'Húmero',
    group: 'breadths',
    unit: 'cm',
    min: 3,
    max: 12,
    decimals: 1,
    aliases: [
      'humeral biepicondilar',
      'diametro humero',
      'biepicondileo humero',
      'humeral',
      'humero',
      'humerus',
    ],
  },
  {
    id: 'femur_breadth',
    label: 'Fémur',
    group: 'breadths',
    unit: 'cm',
    min: 5,
    max: 15,
    decimals: 1,
    aliases: [
      'femoral biepicondilar',
      'diametro femur',
      'biepicondileo femur',
      'femoral',
      'femur',
      'femur breadth',
    ],
  },
  {
    id: 'biacromial_breadth',
    label: 'Biacromial',
    group: 'breadths',
    unit: 'cm',
    min: 25,
    max: 55,
    decimals: 1,
    aliases: ['biacromial', 'diametro biacromial', 'biacromial breadth'],
  },
  {
    id: 'biiliocristal_breadth',
    label: 'Bi-iliocrestídeo',
    group: 'breadths',
    unit: 'cm',
    min: 18,
    max: 45,
    decimals: 1,
    aliases: ['bi iliocrestideo', 'biiliocrestideo', 'iliocrestideo', 'biiliac', 'bicrestal'],
  },
  {
    id: 'chest_transverse_breadth',
    label: 'Tórax transverso',
    group: 'breadths',
    unit: 'cm',
    min: 15,
    max: 45,
    decimals: 1,
    aliases: ['torax transverso', 'diametro torax transverso', 'transverse chest'],
  },
  {
    id: 'chest_ap_breadth',
    label: 'Tórax anteroposterior',
    group: 'breadths',
    unit: 'cm',
    min: 10,
    max: 40,
    decimals: 1,
    aliases: [
      'torax anteroposterior',
      'diametro torax anteroposterior',
      'anteroposterior del torax',
    ],
  },
  {
    id: 'wrist_breadth',
    label: 'Muñeca',
    group: 'breadths',
    unit: 'cm',
    min: 3,
    max: 10,
    decimals: 1,
    aliases: ['muneca', 'diametro muneca', 'biestiloideo', 'wrist'],
  },
];

export const FIELDS_BY_ID: Record<string, AnthropometryField> = Object.fromEntries(
  ANTHROPOMETRY_FIELDS.map((f) => [f.id, f]),
);

/** Campos que mostramos en las tarjetas de resumen, en orden. */
export const SUMMARY_FIELD_IDS = [
  'weight',
  'muscle_mass',
  'fat_mass',
  'bone_mass',
  'body_fat_percentage',
  'bmi',
] as const;

/** Objetivos que el coach puede fijarle a la evaluación. */
export const EVALUATION_GOALS = [
  { value: 'lose_fat', label: 'Bajar grasa' },
  { value: 'gain_muscle', label: 'Ganar masa muscular' },
  { value: 'maintain', label: 'Mantener composición' },
  { value: 'recomposition', label: 'Recomposición corporal' },
  { value: 'performance', label: 'Mejorar rendimiento' },
  { value: 'custom', label: 'Personalizado' },
] as const;

export type EvaluationGoal = (typeof EVALUATION_GOALS)[number]['value'];

export const GOAL_LABELS: Record<string, string> = Object.fromEntries(
  EVALUATION_GOALS.map((g) => [g.value, g.label]),
);

/** Valores de una medición: id de campo -> valor. */
export type MeasurementValues = Record<string, number | string | null>;

export interface EvaluationRecord {
  id: string;
  student_id: string;
  coach_id: string | null;
  type: string;
  measurement_date: string;
  goal: string | null;
  goal_note: string | null;
  notes: string | null;
  source_file_name: string | null;
  source_file_url: string | null;
  raw_data: any;
  created_at: string;
  updated_at: string;
  measurement?: (MeasurementValues & { id: string; evaluation_id: string; extra_data: any }) | null;
}

/** Formatea un valor con la unidad del campo. */
export function formatFieldValue(fieldId: string, value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const field = FIELDS_BY_ID[fieldId];
  if (!field) return String(value);
  if (field.type === 'text') return String(value);
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return String(value);
  const decimals = field.decimals ?? 1;
  return `${num.toFixed(decimals)}${field.unit && field.unit !== 'años' ? ` ${field.unit}` : ''}`.trim();
}
