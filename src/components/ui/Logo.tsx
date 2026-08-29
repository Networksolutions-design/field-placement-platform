interface LogoProps {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "w-10 h-10 text-sm",
  md: "w-12 h-12 text-base",
  lg: "w-16 h-16 text-xl",
};

function initials(name: string) {
  const words = name.split(" ").filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function Logo({ name, color, size = "md" }: LogoProps) {
  return (
    <div
      className={`${sizes[size]} rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-sm`}
      style={{ backgroundColor: color }}
    >
      {initials(name)}
    </div>
  );
}
