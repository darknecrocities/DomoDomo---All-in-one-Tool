import { useEffect, useRef } from 'react';

interface AdSenseUnitProps {
  slot?: string;
  format?: string;
  style?: React.CSSProperties;
}

export const AdSenseUnit = ({ 
  slot = "3689718163", 
  format = "auto", 
  style = { display: 'block' } 
}: AdSenseUnitProps) => {
  const initialized = useRef(false);

  useEffect(() => {
    // Only initialize the ad once on component mount
    if (!initialized.current) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        initialized.current = true;
      } catch (err) {
        console.warn('AdSense unit push failed:', err);
      }
    }
  }, []);

  return (
    <div className="max-w-7xl w-full mx-auto px-4 md:px-6 my-6 flex justify-center">
      <div className="w-full max-w-[728px] overflow-hidden opacity-75 hover:opacity-100 transition-opacity">
        <ins
          className="adsbygoogle"
          style={style}
          data-ad-client="ca-pub-7800058547773500"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};
