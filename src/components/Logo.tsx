interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const Logo = ({ className = '', size = 40, showText = true }: LogoProps) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <img
        src="/domodomo.png"
        width={size}
        height={size}
        alt="DomoDomo Logo"
        className="transform transition-transform duration-300 hover:scale-105 cursor-pointer rounded-xl overflow-hidden shadow-md border border-[#2A2D30] object-cover"
      />
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-2xl tracking-tight leading-none bg-gradient-to-r from-white via-gray-350 to-gray-400 bg-clip-text text-transparent font-sans">
              Domo<span className="text-[#ECEBE9] font-semibold">Domo</span>
            </span>
            <img 
              src="/panda.png" 
              className="w-6 h-6 animate-pulse-slow object-contain hover:rotate-12 transition-transform duration-300" 
              alt="Panda Mascot" 
            />
          </div>
          <span className="text-[9px] uppercase tracking-[0.18em] text-[#72706C] font-bold leading-none mt-1">
            All-in-One Tool Hub
          </span>
        </div>
      )}
    </div>
  );
};
