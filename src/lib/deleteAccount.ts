import { supabase } from "@/integrations/supabase/client";

/**
 * Borra la cuenta del alumno autenticado y TODOS sus datos personales.
 * Llama a la función SQL `delete_my_account()` (SECURITY DEFINER) — ver
 * `scripts/setup-account-deletion.sql`, que hay que correr una vez en el
 * dashboard de Supabase. Luego cierra la sesión.
 *
 * Requisito de la App Store (guideline 5.1.1(v)): toda app con registro/login
 * debe permitir eliminar la cuenta desde adentro.
 */
export async function deleteMyAccount(): Promise<void> {
  // La función no está en los types generados → cliente casteado (como los
  // otros apis del proyecto).
  const rpc = (supabase as unknown as {
    rpc: (fn: string) => Promise<{ error: { message: string } | null }>;
  }).rpc;

  const { error } = await rpc("delete_my_account");
  if (error) throw new Error(error.message);

  await supabase.auth.signOut();
}
