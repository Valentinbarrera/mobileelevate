import { User } from "lucide-react";

interface ProfileAvatarProps {
  name: string;
  memberType: string;
  memberSince: string;
  avatar: string | null;
}

const ProfileAvatar = ({
  name,
  memberType,
  memberSince,
  avatar,
}: ProfileAvatarProps) => {
  // ELEVATE ALUMNO = miembro con coach → acento de marca; FREE = neutro.
  const isPro = memberType.includes("ALUMNO");

  return (
    <div className="px-5 lg:px-0 pt-5 lg:pt-0 mb-6 lg:mb-0">
      <div className="card-hero rounded-3xl p-5 flex items-center gap-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/50 p-0.5">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
              {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-9 h-9 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>

        {/* Identidad */}
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-black tracking-tight text-foreground truncate leading-tight">
            {name}
          </h2>

          <span
            className={`inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              isPro
                ? "bg-primary/15 border border-primary/25 text-primary"
                : "bg-secondary border border-white/[0.06] text-muted-foreground"
            }`}
          >
            {isPro && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
            {memberType}
          </span>

          <p className="text-sm text-muted-foreground mt-2 truncate">{memberSince}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileAvatar;
