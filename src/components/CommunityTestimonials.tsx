import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Quote, Heart, Sparkles, ChevronLeft, ChevronRight, LayoutGrid, Box, UserCheck } from 'lucide-react';
import { COMMUNITY_TESTIMONIALS } from '../data/testimonialsData';
import type { Testimonial } from '../data/testimonialsData';

interface CommunityTestimonialsProps {
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export const CommunityTestimonials = ({
  title = "Real Community Feedback",
  subtitle = "Direct reviews & thoughts from developers, makers, and creators in our community.",
  compact = false
}: CommunityTestimonialsProps) => {
  const [filter, setFilter] = useState<'all' | 'featured'>('all');
  const [viewMode, setViewMode] = useState<'cube' | 'grid'>('cube');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [visibleCount, setVisibleCount] = useState<number>(compact ? 6 : 9);

  const filteredTestimonials = COMMUNITY_TESTIMONIALS.filter((item) => {
    return filter === 'all' || (filter === 'featured' && item.featured);
  });

  const totalItems = filteredTestimonials.length;

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, totalItems));
  }, [totalItems]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, totalItems)) % Math.max(1, totalItems));
  }, [totalItems]);

  // Continuous automatic 3D box loop rotation
  useEffect(() => {
    if (viewMode !== 'cube' || totalItems === 0) return;
    const interval = setInterval(() => {
      handleNext();
    }, 3000);
    return () => clearInterval(interval);
  }, [viewMode, totalItems, handleNext]);

  // Helper to safely fetch item at relative offset
  const getItemAtOffset = (offset: number): Testimonial => {
    if (totalItems === 0) return COMMUNITY_TESTIMONIALS[0];
    const index = (currentIndex + offset + totalItems * 100) % totalItems;
    return filteredTestimonials[index] || filteredTestimonials[0];
  };

  // 4 Faces of the 3D Box Cube (Front = 0deg, Right = 90deg, Back = 180deg, Left = 270deg)
  const cubeFaces = [
    { offset: 0, rotation: 0 },
    { offset: 1, rotation: 90 },
    { offset: 2, rotation: 180 },
    { offset: -1, rotation: 270 },
  ];

  return (
    <section className="flex flex-col gap-6 p-6 md:p-8 rounded-3xl bg-[#18191B] border border-[#2A2D30] relative overflow-hidden shadow-xl text-left">
      {/* Subtle Dark Background Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(42,45,48,0.25),rgba(17,18,19,0))]" />

      {/* Header Controls Bar (100% Dark Grey Theme - NO GREEN) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10">
        <div className="flex flex-col gap-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2A2D30] text-[#ECEBE9] border border-[#3A3D40] text-xs font-bold w-fit">
            <MessageSquare size={13} className="text-[#A3A09B]" />
            <span>Community Feedback</span>
            <span className="bg-[#111213] text-[#ECEBE9] border border-[#3A3D40] text-[10px] px-2 py-0.2 rounded-full font-mono">
              {COMMUNITY_TESTIMONIALS.length}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-[#ECEBE9] font-heading tracking-tight">
            {title}
          </h2>
          <p className="text-xs md:text-sm text-[#A3A09B] max-w-xl leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* View Mode & Filter Toggles */}
        <div className="flex flex-wrap items-center gap-2 z-10 self-start md:self-auto">
          {/* 3D Cube vs Grid Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-[#111213] border border-[#2A2D30]">
            <button
              onClick={() => setViewMode('cube')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'cube'
                  ? 'bg-[#2A2D30] text-[#ECEBE9] border border-[#4A4D52] shadow-sm'
                  : 'text-[#72706C] hover:text-[#ECEBE9]'
              }`}
              title="3D Rotating Box Mode"
            >
              <Box size={13} className={viewMode === 'cube' ? 'text-[#ECEBE9]' : ''} />
              <span>3D Cube Box</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-[#2A2D30] text-[#ECEBE9] border border-[#4A4D52] shadow-sm'
                  : 'text-[#72706C] hover:text-[#ECEBE9]'
              }`}
              title="Grid View Mode"
            >
              <LayoutGrid size={13} className={viewMode === 'grid' ? 'text-[#ECEBE9]' : ''} />
              <span>Grid View</span>
            </button>
          </div>

          {/* Filter Pills */}
          <button
            onClick={() => {
              setFilter('all');
              setCurrentIndex(0);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              filter === 'all'
                ? 'bg-[#2A2D30] border-[#4A4D52] text-[#ECEBE9]'
                : 'bg-[#111213] border-[#2A2D30] text-[#72706C] hover:text-[#ECEBE9]'
            }`}
          >
            All ({COMMUNITY_TESTIMONIALS.length})
          </button>
          <button
            onClick={() => {
              setFilter('featured');
              setCurrentIndex(0);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              filter === 'featured'
                ? 'bg-[#2A2D30] border-[#4A4D52] text-[#ECEBE9]'
                : 'bg-[#111213] border-[#2A2D30] text-[#72706C] hover:text-[#ECEBE9]'
            }`}
          >
            <Sparkles size={12} className="text-[#A3A09B]" />
            <span>Top Picks</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: LITERAL 3D AUTOMATIC ROTATING CUBE BOX */}
      {viewMode === 'cube' ? (
        <div className="flex flex-col gap-6 z-10 my-2">
          {/* 3D Perspective Stage Container */}
          <div
            className="w-full relative py-10 flex items-center justify-center min-h-[290px] md:min-h-[310px] overflow-hidden"
            style={{ perspective: '1100px' }}
          >
            {/* The Physical 3D Rotating Cube Box Stage */}
            <div
              className="relative w-full max-w-lg md:max-w-xl h-[230px] md:h-[250px] transition-transform duration-1000 ease-in-out"
              style={{
                transformStyle: 'preserve-3d',
                transform: `rotateY(${-currentIndex * 90}deg) rotateX(-5deg)`,
              }}
            >
              {cubeFaces.map((face) => {
                const item = getItemAtOffset(face.offset);
                if (!item) return null;

                return (
                  <div
                    key={`${face.offset}-${item.id}`}
                    className="absolute inset-0 w-full h-full flex flex-col justify-between p-6 rounded-2xl bg-[#111213] border border-[#3A3D40] shadow-[0_15px_35px_rgba(0,0,0,0.8)] text-left select-none"
                    style={{
                      transformStyle: 'preserve-3d',
                      backfaceVisibility: 'hidden',
                      transform: `rotateY(${face.rotation}deg) translateZ(240px)`,
                    }}
                  >
                    {/* Top Row: User Avatar & Info */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#2A2D30] border border-[#4A4D52] flex items-center justify-center text-[#ECEBE9] font-black text-xs shadow-inner shrink-0">
                          {item.initials}
                        </div>
                        <div className="flex flex-col leading-tight text-left">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-extrabold text-[#ECEBE9]">
                              {item.name}
                            </span>
                            <span title="Verified Member">
                              <UserCheck size={13} className="text-[#A3A09B]" />
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-[#72706C]">
                            {item.role}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-[#A3A09B] bg-[#18191B] px-2.5 py-1 rounded-lg border border-[#2A2D30]">
                        {item.date}
                      </span>
                    </div>

                    {/* Quote Content */}
                    <div className="relative pt-2">
                      <Quote size={18} className="text-[#5A5D62]/40 absolute -top-1 -left-1" />
                      <p className="text-xs md:text-sm text-[#C5C3C0] leading-relaxed relative z-10 italic pl-4 font-normal">
                        "{item.quote}"
                      </p>
                    </div>

                    {/* Card Footer Accent (100% Dark Grey - NO GREEN) */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#2A2D30] text-[10px] text-[#72706C]">
                      <span className="flex items-center gap-1.5 text-[#A3A09B] font-bold">
                        <Heart size={12} className="fill-[#3A3D40] text-[#72706C]" />
                        <span>Verified Feedback</span>
                      </span>
                      {item.featured && (
                        <span className="px-2.5 py-0.5 rounded bg-[#2A2D30] text-[#ECEBE9] border border-[#4A4D52] font-bold uppercase tracking-wider text-[9px]">
                          Top Review
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3D Cube Interactive Navigation Controls */}
          <div className="flex items-center justify-between border-t border-[#2A2D30] pt-4 z-10">
            {/* Middle: Slide Position Indicators */}
            <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto max-w-[200px] scrollbar-none py-1">
              {filteredTestimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentIndex % totalItems === i
                      ? 'w-6 bg-[#ECEBE9]'
                      : 'w-1.5 bg-[#2A2D30] hover:bg-[#72706C]'
                  }`}
                  title={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Right: Previous / Next 3D Box Rotation buttons */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[#72706C] mr-1">
                {(currentIndex % Math.max(1, totalItems)) + 1} / {totalItems}
              </span>
              <button
                onClick={handlePrev}
                className="p-2 rounded-xl bg-[#111213] border border-[#2A2D30] hover:border-[#4A4D52] text-[#ECEBE9] transition-all"
                title="Rotate 3D Box Left"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                className="p-2 rounded-xl bg-[#111213] border border-[#2A2D30] hover:border-[#4A4D52] text-[#ECEBE9] transition-all"
                title="Rotate 3D Box Right"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW MODE 2: GRID VIEW (100% DARK GREY - NO GREEN) */
        <div className="flex flex-col gap-4 z-10 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTestimonials.slice(0, visibleCount).map((item: Testimonial) => (
              <div
                key={item.id}
                className="group flex flex-col justify-between p-5 rounded-2xl bg-[#111213] border border-[#2A2D30] hover:border-[#4A4D52] transition-all duration-300 shadow-md text-left"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#2A2D30] border border-[#3A3D40] flex items-center justify-center text-[#ECEBE9] font-black text-xs shadow-inner shrink-0">
                        {item.initials}
                      </div>
                      <div className="flex flex-col leading-tight text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-[#ECEBE9] group-hover:text-[#A3A09B] transition-colors">
                            {item.name}
                          </span>
                          <span title="Verified Member">
                            <UserCheck size={12} className="text-[#72706C]" />
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-[#72706C]">
                          {item.role}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-[#72706C] bg-[#18191B] px-2 py-0.5 rounded-md border border-[#2A2D30]">
                      {item.date}
                    </span>
                  </div>

                  <div className="relative pt-1">
                    <Quote size={16} className="text-[#5A5D62]/30 absolute -top-1 -left-1" />
                    <p className="text-xs text-[#C5C3C0] leading-relaxed relative z-10 italic pl-3 font-normal">
                      "{item.quote}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#2A2D30] text-[10px] text-[#72706C]">
                  <span className="flex items-center gap-1 text-[#72706C]">
                    <Heart size={11} className="fill-[#3A3D40] text-[#72706C]" />
                    <span>Verified Feedback</span>
                  </span>
                  {item.featured && (
                    <span className="px-2 py-0.5 rounded bg-[#2A2D30] text-[#ECEBE9] border border-[#3A3D40] font-bold uppercase tracking-wider text-[9px]">
                      Top Review
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredTestimonials.length > visibleCount && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setVisibleCount((prev) => prev + 6)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#111213] border border-[#2A2D30] hover:border-[#4A4D52] text-xs font-bold text-[#ECEBE9] transition-all shadow-md"
              >
                <span>Load More Reviews ({filteredTestimonials.length - visibleCount} remaining)</span>
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
