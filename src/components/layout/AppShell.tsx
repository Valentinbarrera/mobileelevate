/**
 * AppShell — Layout wrapper
 * - Mobile/tablet (<lg): renders BottomNav at the bottom
 * - Desktop (lg+): renders SideNav on the left, content shifted right
 */
import type { ReactNode } from "react";
import BottomNav from "@/components/home/BottomNav";
import SideNav from "@/components/layout/SideNav";

interface AppShellProps {
  children: ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar — visible only lg+ */}
      <SideNav />

      {/* Main content area */}
      {/* lg: offset by sidebar width (72px icon-only, 224px wide on xl) */}
      <main className="flex-1 min-w-0 lg:ml-[72px] xl:ml-56">
        {children}
      </main>

      {/* Bottom nav — hidden on lg+, shown on mobile/tablet */}
      <BottomNav />
    </div>
  );
};

export default AppShell;
