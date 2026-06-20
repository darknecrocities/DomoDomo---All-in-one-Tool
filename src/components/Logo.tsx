interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const Logo = ({ className = '', size = 40, showText = true }: LogoProps) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transform transition-transform duration-300 hover:scale-105 cursor-pointer rounded-xl overflow-hidden shadow-md border border-[#4E8E5E]/20"
      >
        {/* Background matching domodomo.png green */}
        <rect width="100" height="100" fill="#4E8E5E" />
        
        {/* Domo Head Base */}
        <path
          d="M5 100 C 5 65, 20 48, 50 48 C 80 48, 95 65, 95 100 Z"
          fill="#FFFFFF"
        />
        
        {/* Domo Left Ear */}
        <circle cx="22" cy="62" r="14" fill="#FFFFFF" />
        <circle cx="22" cy="62" r="8" fill="#4E8E5E" />

        {/* Domo Right Ear */}
        <circle cx="78" cy="62" r="14" fill="#FFFFFF" />
        <circle cx="78" cy="62" r="8" fill="#4E8E5E" />

        {/* Re-draw Head base over ears slightly to merge */}
        <path
          d="M10 100 C 10 60, 25 50, 50 50 C 75 50, 90 60, 90 100 Z"
          fill="#FFFFFF"
        />

        {/* Hair Tuft Spikes on top */}
        <path
          d="M44 51 C 44 45, 47 42, 50 42 C 50 46, 47 50, 44 51 Z"
          fill="#FFFFFF"
        />
        <path
          d="M50 51 C 51 44, 55 41, 58 42 C 57 47, 53 50, 50 51 Z"
          fill="#FFFFFF"
        />

        {/* Big Green Eyes */}
        {/* Left Eye */}
        <circle cx="33" cy="79" r="16.5" fill="#4E8E5E" />
        <circle cx="33" cy="79" r="10.5" fill="#FFFFFF" />
        <circle cx="35" cy="75" r="4.5" fill="#4E8E5E" />

        {/* Right Eye */}
        <circle cx="67" cy="79" r="16.5" fill="#4E8E5E" />
        <circle cx="67" cy="79" r="10.5" fill="#FFFFFF" />
        <circle cx="69" cy="75" r="4.5" fill="#4E8E5E" />

        {/* Tiny Green Nose */}
        <ellipse cx="50" cy="94" r="5" rx="5" ry="3.5" fill="#4E8E5E" />
      </svg>
      {showText && (
        <div className="flex flex-col">
          <span className="font-extrabold text-2xl tracking-tight leading-none bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 bg-clip-text text-transparent font-sans">
            Domo<span className="text-white font-semibold">Domo</span>
          </span>
          <span className="text-[9px] uppercase tracking-[0.25em] text-slate-500 font-bold leading-none mt-1">
            Local Toolbox
          </span>
        </div>
      )}
    </div>
  );
};
