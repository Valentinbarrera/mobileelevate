/**
 * Cruza el equipamiento de un ejercicio de la BIBLIOTECA con lo que el alumno
 * dijo que tiene en su gym (paso "¿Dónde entrenás?" del cuestionario).
 *
 * La biblioteca la carga el coach desde la web con su propia taxonomía
 * ("Barra", "Máquina", "Polea", "Peso corporal"…, ver elevate-web
 * exerciseTaxonomy) y hay ejercicios viejos con texto libre. Acá lo llevamos a
 * las opciones del cuestionario. Ante la duda el ejercicio SE MUESTRA: esconder
 * uno que sí podías hacer es peor que mostrar uno que no.
 */
import { expandEquipment, normalizeName } from "./exerciseCatalog";
import { loadOnboarding } from "./onboarding";

// Mismos textos que EQUIPMENT_OPTIONS en onboarding.ts
const BARRA = "Barra y discos";
const MANCUERNAS = "Mancuernas";
const MAQUINAS = "Máquinas / poleas";
const BANDAS = "Bandas elásticas";
const KETTLE = "Kettlebells";
const BANCO = "Banco";

/** Lo que pide el ejercicio, o null si no pide nada que haya que tener. */
export function libraryEquipmentNeed(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const v = normalizeName(raw);
  // Peso corporal y barras de colgarse: se hacen en cualquier lado.
  if (/corporal|bodyweight|ninguno|sin equipo|paralela|barra fija|dominada|trx/.test(v)) return null;
  if (/mancuerna|dumbbell/.test(v)) return MANCUERNAS;
  if (/kettle|pesa rusa/.test(v)) return KETTLE;
  if (/banda|elastic|band/.test(v)) return BANDAS;
  if (/maquina|machine|polea|cable|smith|prensa/.test(v)) return MAQUINAS;
  if (/barra|barbell|disco|plate/.test(v)) return BARRA;
  if (/banco|bench/.test(v)) return BANCO;
  return null;
}

/** ¿Se puede hacer en el gym del alumno? Sin gym cargado, todo vale. */
export function fitsMyGym(raw: string | null | undefined, myEquipment: string[]): boolean {
  if (myEquipment.length === 0) return true;
  const need = libraryEquipmentNeed(raw);
  if (!need) return true;
  return expandEquipment(myEquipment).includes(need);
}

/** Equipamiento declarado en el cuestionario (vacío si no lo completó). */
export const loadMyGymEquipment = (studentId: string): string[] =>
  loadOnboarding(studentId).equipment;
