import domodomoLogo from '../assets/domodomo.png';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const Logo = ({ className = '', size = 40, showText = true }: LogoProps) => {
  return (
    <div className={`flex items-center gap-3 select-none group ${className}`}>
      <div className="relative">
        {/* Festive Santa Hat overlay perched playfully on panda head */}
        <div 
          className="absolute -top-3.5 -left-2.5 w-7 h-7 pointer-events-none transform -rotate-12 drop-shadow-md z-10 transition-transform duration-300 group-hover:rotate-0 group-hover:scale-110"
          title="Holiday Season Edition"
        >
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Red hat body */}
            <path d="M7 23C8 17 14 8 25 10C24 16 23 20 22 23H7Z" fill="#E11D48" />
            {/* Hat shadow / crease */}
            <path d="M12 18C15 13 19 11 25 10C24 13 23 18 22 23H18C16 21 14 19 12 18Z" fill="#BE123C" opacity="0.6" />
            {/* Fluffy white brim */}
            <rect x="5" y="21" width="19" height="5" rx="2.5" fill="#FFFFFF" />
            {/* Fluffy white pom-pom */}
            <circle cx="26" cy="10" r="3.5" fill="#FFFFFF" />
          </svg>
        </div>
        <img
          src={domodomoLogo}
          width={size}
          height={size}
          className="transform transition-transform duration-300 group-hover:scale-105 cursor-pointer rounded-xl overflow-hidden shadow-md border border-[#2A2D30]"
          style={{ width: size, height: size, objectFit: 'contain' }}
          alt="DomoDomo Logo"
        />
      </div>
      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-2xl tracking-tight leading-none text-text font-sans">
              Domo<span className="font-semibold">Domo</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[9px] uppercase tracking-[0.16em] text-[#72706C] font-bold leading-none">
              All-in-One Tool Hub
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-[#A3A09B] border border-white/10 font-mono font-bold leading-none flex items-center gap-1">
              <span>❄️</span>
              <span className="hidden sm:inline">Winter</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
