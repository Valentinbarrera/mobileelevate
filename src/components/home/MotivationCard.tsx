interface MotivationCardProps {
  message: string;
  author?: string;
}

const MotivationCard = ({ message, author = "Tu Coach" }: MotivationCardProps) => {
  return (
    <div className="mx-4 mt-6 mb-8 bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/30 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">💪</span>
        <div>
          <p className="text-foreground font-medium italic">"{message}"</p>
          <p className="text-primary text-sm font-semibold mt-2">— {author}</p>
        </div>
      </div>
    </div>
  );
};

export default MotivationCard;
