import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { AudioSettingsModal } from './AudioSettingsModal';
import {
  getExperienceSettings,
  saveExperienceSettings,
  type ExperienceSettings,
} from '../utils/experienceSettings';
import { setupThockAudioListener, playClickSound } from '../utils/soundEffects';

export const GlobalSFXController: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<ExperienceSettings>(getExperienceSettings());

  useEffect(() => {
    // Initialize global DOM navigation thock audio listener
    const cleanupListener = setupThockAudioListener();

    // Listen to local experience updates
    const handleSettingsUpdate = (e: CustomEvent<ExperienceSettings>) => {
      if (e.detail) {
        setSettings(e.detail);
      } else {
        setSettings(getExperienceSettings());
      }
    };

    const handleOpenModal = () => {
      setIsOpen(true);
    };

    const handleToggleMute = () => {
      const current = getExperienceSettings();
      if (current.profile === 'mute' || current.volume === 0) {
        saveExperienceSettings({ profile: 'oil_king', volume: 0.75 });
      } else {
        saveExperienceSettings({ profile: 'mute' });
      }
    };

    window.addEventListener('domodomo_sfx_update' as any, handleSettingsUpdate as any);
    window.addEventListener('open_sfx_settings' as any, handleOpenModal as any);
    window.addEventListener('toggle_sfx_mute' as any, handleToggleMute as any);

    return () => {
      cleanupListener();
      window.removeEventListener('domodomo_sfx_update' as any, handleSettingsUpdate as any);
      window.removeEventListener('open_sfx_settings' as any, handleOpenModal as any);
      window.removeEventListener('toggle_sfx_mute' as any, handleToggleMute as any);
    };
  }, []);

  const isMuted = settings.profile === 'mute' || settings.volume === 0;

  return (
    <>
      {/* Floating SFX Trigger Button */}
      <button
        aria-label="Open Mechanical Switch Audio Customizer"
        onClick={() => {
          playClickSound();
          setIsOpen(true);
        }}
        data-thock="true"
        className="fixed bottom-6 right-20 z-40 p-2.5 sm:p-3 rounded-full bg-[#18191B]/90 hover:bg-[#1E2022] border border-[#2A2D30] text-[#ECEBE9] shadow-xl hover:shadow-2xl hover:border-[#3C6B4D]/60 backdrop-blur-md transition-all duration-200 cursor-pointer group flex items-center gap-2 hover:scale-105 active:scale-95"
        title="Audio & SFX Switch Customizer"
      >
        <div className="relative flex items-center justify-center">
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-[#72706C] group-hover:text-[#ECEBE9] transition-colors" />
          ) : (
            <Volume2 className="w-4 h-4 text-[#3C6B4D] animate-pulse" />
          )}
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#A3A09B] group-hover:text-[#ECEBE9] pr-1 hidden md:inline">
          SFX Hub
        </span>
        {settings.ambientType !== 'off' && (
          <span className="w-2 h-2 rounded-full bg-[#3C6B4D] animate-ping" />
        )}
      </button>

      {/* Audio Customizer Modal */}
      <AudioSettingsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
