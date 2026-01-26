interface GreetingProps {
  userName: string;
  subtitle?: string;
}

const Greeting = ({ userName, subtitle = "Tu entrenador online todo en uno" }: GreetingProps) => {
  return (
    <div className="px-4 pt-2 pb-4">
      <h1 className="text-3xl font-black text-foreground tracking-tight">
        ¡HOLA, {userName.toUpperCase()}!
      </h1>
      <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wider">
        {subtitle}
      </p>
    </div>
  );
};

export default Greeting;
