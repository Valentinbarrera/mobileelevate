interface GreetingProps {
  userName: string;
  subtitle?: string;
  todayStatus?: string;
}

const Greeting = ({ 
  userName, 
  subtitle = "Tu entrenador online todo en uno",
  todayStatus = "Hoy entrenás: Piernas y Glúteos"
}: GreetingProps) => {
  return (
    <div className="px-5 pt-4 pb-5">
      {/* Saludo principal - Jerarquía 1 */}
      <h1 className="text-3xl font-black text-foreground tracking-tight leading-tight">
        ¡HOLA, <span className="text-gradient-primary">{userName.toUpperCase()}</span>!
      </h1>
      
      {/* Subtítulo - Jerarquía 3 */}
      <p className="text-muted-foreground text-xs mt-1 uppercase tracking-[0.2em]">
        {subtitle}
      </p>
      
      {/* Estado del día - Jerarquía 2 (más prominente que el subtítulo) */}
      <div className="mt-4 flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-xl px-4 py-3">
        <span className="text-2xl">🔥</span>
        <p className="text-foreground font-semibold text-sm">
          {todayStatus}
        </p>
      </div>
    </div>
  );
};

export default Greeting;
