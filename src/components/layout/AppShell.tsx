/**
 * AppShell — passthrough.
 *
 * La navegación (SideNav + BottomNav) ahora vive en AppLayout, que se monta una
 * sola vez para todas las pantallas con nav. AppShell quedó como passthrough
 * para no tener que tocar cada página que lo envuelve.
 */
import type { ReactNode } from "react";

const AppShell = ({ children }: { children: ReactNode }) => <>{children}</>;

export default AppShell;
