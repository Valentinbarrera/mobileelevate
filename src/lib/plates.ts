/**
 * Plate calculator: dado un peso total y el peso de la barra, calcula qué
 * discos poner POR LADO. Pensado para barra olímpica (20 kg) y discos
 * estándar de gimnasio, pero ambos son configurables.
 */
export interface PlateResult {
  /** Discos a poner por lado, de mayor a menor (ej: [20, 10, 2.5]) */
  perSide: number[];
  /** Kg que no se pudieron representar exactamente con los discos disponibles */
  leftover: number;
}

export const DEFAULT_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];
export const DEFAULT_BAR_KG = 20;

export function calcPlates(
  totalKg: number,
  barKg: number = DEFAULT_BAR_KG,
  available: number[] = DEFAULT_PLATES,
): PlateResult {
  let perSideWeight = (totalKg - barKg) / 2;
  const perSide: number[] = [];

  if (!Number.isFinite(perSideWeight) || perSideWeight <= 0) {
    return { perSide, leftover: 0 };
  }

  for (const plate of available) {
    while (perSideWeight >= plate - 1e-9) {
      perSide.push(plate);
      perSideWeight -= plate;
    }
  }

  return { perSide, leftover: Math.round(perSideWeight * 100) / 100 };
}
