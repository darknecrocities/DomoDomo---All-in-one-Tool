import React from 'react';

interface AppBuildersWidgetProps {
  className?: string;
  compact?: boolean;
}

export const AppBuildersWidget: React.FC<AppBuildersWidgetProps> = ({ className = '', compact = false }) => {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-2xl border border-[#2A2D30] bg-[#18191B] p-0.5 shadow-md hover:border-[#3C6B4D]/60 transition-all overflow-hidden max-w-full ${compact ? 'w-full sm:w-auto' : 'shrink-0'} ${className}`}
      title="Vote for DomoDomo on App Builders PH"
    >
      <iframe
        src="https://appbuildersph.com/embed/apps/domodomo"
        title="DomoDomo votes on App Builders PH"
        width="320"
        height="72"
        style={{ border: 0, overflow: 'hidden' }}
        loading="lazy"
        scrolling="no"
        className={`h-[72px] rounded-xl block max-w-full ${compact ? 'w-full min-w-[240px] max-w-[320px]' : 'w-[320px]'}`}
      />
    </div>
  );
};

export default AppBuildersWidget;
