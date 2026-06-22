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
        className="transform transition-transform duration-300 hover:scale-105 cursor-pointer rounded-xl overflow-hidden shadow-md border border-secondary/20"
        style={{ width: size, height: size, objectFit: 'contain' }}
        alt="DomoDomo Logo"
      />
      {showText && (
        <div className="flex flex-col">
          <span className="font-extrabold text-2xl tracking-tight leading-none bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 bg-clip-text text-transparent font-sans">
            Domo<span className="text-white font-semibold">Domo</span>
          </span>
          <span className="text-[9px] uppercase tracking-[0.18em] text-[#72706C] font-bold leading-none mt-1">
            All-in-One Tool Hub
          </span>
        </div>
      )}
    </div>
  );
};
