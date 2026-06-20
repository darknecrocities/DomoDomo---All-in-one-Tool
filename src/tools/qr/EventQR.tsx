import { triggerDownload, generateDesignedQR } from '../../utils/sharedHelpers';
import { useState, useEffect } from 'react';
import { Calendar, Download, Sparkles, Clock } from 'lucide-react';
import { QRStylingPanel } from '../../components/QRStylingPanel';
import type { QRStyleSettings } from '../../components/QRStylingPanel';

type EventCategory = 'wedding' | 'concert' | 'birthday' | 'conference' | 'meetup';

export const EventQRTool = () => {
  const [title, setTitle] = useState('DomoDomo Launch Meet');
  const [startDate, setStartDate] = useState('2026-06-25T09:00');
  const [endDate, setEndDate] = useState('2026-06-25T12:00');
  const [location, setLocation] = useState('Manila, PH');
  const [desc, setDesc] = useState('Highlighting multi-purpose open source tools');
  const [qrUrl, setQrUrl] = useState('');

  // 10 Features States
  const [category, setCategory] = useState<EventCategory>('meetup');
  const [reminderMinutes, setReminderMinutes] = useState(15);
  const [latCoord, setLatCoord] = useState('');
  const [lngCoord, setLngCoord] = useState('');
  const [organizerName, setOrganizerName] = useState('Arron Kian Parejas');
  const [organizerEmail, setOrganizerEmail] = useState('organizer@domodomo.dev');
  const [ticketColor, setTicketColor] = useState('#8B5CF6'); // Violet ticket preview
  const [eyeStyle, setEyeStyle] = useState<'square' | 'circle' | 'rounded'>('rounded');
  const [countdownText, setCountdownText] = useState('');
  const [durationText, setDurationText] = useState('');

  const [settings, setSettings] = useState<QRStyleSettings>({
    fgColor: '#4E8E5E',
    bgColor: '#0B0F19',
    margin: 2,
    errorCorrection: 'Q',
    size: 400,
    format: 'png',
    logoPreset: 'star',
    theme: 'emerald'
  });

  const formatToiCalDate = (dateTimeStr: string): string => {
    const dateObj = new Date(dateTimeStr);
    if (isNaN(dateObj.getTime())) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = dateObj.getFullYear();
    const mm = pad(dateObj.getMonth() + 1);
    const dd = pad(dateObj.getDate());
    const hh = pad(dateObj.getHours());
    const min = pad(dateObj.getMinutes());
    return `${yyyy}${mm}${dd}T${hh}${min}00`;
  };

  const getICSContent = () => {
    const startFormatted = formatToiCalDate(startDate);
    const endFormatted = formatToiCalDate(endDate);

    let content = 'BEGIN:VCALENDAR\n';
    content += 'VERSION:2.0\n';
    content += 'BEGIN:VEVENT\n';
    content += `SUMMARY:${title}\n`;
    if (startFormatted) content += `DTSTART:${startFormatted}Z\n`;
    if (endFormatted) content += `DTEND:${endFormatted}Z\n`;
    content += `LOCATION:${location}\n`;
    content += `DESCRIPTION:${desc}\n`;
    if (latCoord && lngCoord) {
      content += `GEO:${latCoord};${lngCoord}\n`;
    }
    if (organizerName && organizerEmail) {
      content += `ORGANIZER;CN="${organizerName}":MAILTO:${organizerEmail}\n`;
    }
    content += 'BEGIN:VALARM\n';
    content += 'TRIGGER:-PT' + reminderMinutes + 'M\n';
    content += 'ACTION:DISPLAY\n';
    content += `DESCRIPTION:Reminder: ${title}\n`;
    content += 'END:VALARM\n';
    content += 'END:VEVENT\n';
    content += 'END:VCALENDAR';
    return content;
  };

  const generate = async () => {
    try {
      const ics = getICSContent();
      const url = await generateDesignedQR(ics, {
        ...settings,
        eyeFrameStyle: eyeStyle,
        eyeBallStyle: eyeStyle === 'circle' ? 'circle' : 'square',
        moduleStyle: 'rounded'
      });
      setQrUrl(url);
    } catch (e) {
      console.error(e);
    }
  };

  // Event Duration and Countdown Calculator
  useEffect(() => {
    const startObj = new Date(startDate);
    const endObj = new Date(endDate);
    
    // Duration
    if (!isNaN(startObj.getTime()) && !isNaN(endObj.getTime())) {
      const diffMs = endObj.getTime() - startObj.getTime();
      if (diffMs > 0) {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        setDurationText(`${hours}h ${mins}m`);
      } else {
        setDurationText('Invalid duration');
      }
    }

    // Countdown
    const now = new Date();
    if (!isNaN(startObj.getTime())) {
      const timeToStart = startObj.getTime() - now.getTime();
      if (timeToStart > 0) {
        const days = Math.floor(timeToStart / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeToStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setCountdownText(`Starts in ${days}d ${hours}h`);
      } else {
        setCountdownText('Event has started / passed');
      }
    }
  }, [startDate, endDate]);

  useEffect(() => {
    generate();
  }, [title, startDate, endDate, location, desc, category, reminderMinutes, latCoord, lngCoord, organizerName, organizerEmail, eyeStyle, settings]);

  const handleDownloadICS = () => {
    const icsContent = getICSContent();
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.ics`);
    URL.revokeObjectURL(url);
  };

  const getGoogleCalendarLink = () => {
    const startFormatted = formatToiCalDate(startDate);
    const endFormatted = formatToiCalDate(endDate);
    const details = encodeURIComponent(desc);
    const loc = encodeURIComponent(location);
    const name = encodeURIComponent(title);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${name}&dates=${startFormatted}Z/${endFormatted}Z&details=${details}&location=${loc}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      {/* Settings Panel */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white flex items-center gap-2 text-lg">
              <Calendar className="text-[#4E8E5E]" size={20} />
              <span>Event Calendar QR Generator</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">iCalendar Card</span>
          </div>

          {/* Event category tags */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-450 font-semibold">Event Classification</label>
            <div className="flex flex-wrap gap-2">
              {(['meetup', 'wedding', 'concert', 'birthday', 'conference'] as EventCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1 rounded-xl border text-[10px] uppercase font-bold transition-all ${
                    category === cat ? 'bg-[#4E8E5E]/20 text-[#4E8E5E] border-[#4E8E5E]' : 'bg-slate-950/40 border-slate-850 text-slate-550'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-semibold">Event Title</label>
            <input
              type="text"
              placeholder="e.g. Project Sync"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold">Start Date & Time</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-350 focus:outline-none focus:border-[#4E8E5E]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold">End Date & Time</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-350 focus:outline-none focus:border-[#4E8E5E]"
              />
            </div>
          </div>

          {/* Location & Map Coordinates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold">Location Venue</label>
              <input
                type="text"
                placeholder="e.g. Conference Room A / Virtual Link"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold">Reminder Alert</label>
              <select
                value={reminderMinutes}
                onChange={(e) => setReminderMinutes(Number(e.target.value))}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
              >
                <option value="5">5 min before</option>
                <option value="15">15 min before</option>
                <option value="60">1 hour before</option>
                <option value="1440">1 day before</option>
              </select>
            </div>
          </div>

          {/* Map pinning coordinates */}
          <div className="grid grid-cols-2 gap-4 bg-slate-950/20 p-3 rounded-xl border border-slate-850">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Latitude Coordinate</span>
              <input
                type="text"
                placeholder="e.g. 14.5995"
                value={latCoord}
                onChange={(e) => setLatCoord(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Longitude Coordinate</span>
              <input
                type="text"
                placeholder="e.g. 120.9842"
                value={lngCoord}
                onChange={(e) => setLngCoord(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Organizer profiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold">Planner Organizer Name</label>
              <input
                type="text"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold">Organizer Email</label>
              <input
                type="email"
                value={organizerEmail}
                onChange={(e) => setOrganizerEmail(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-semibold">Description</label>
            <textarea
              placeholder="Brief details about the event..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full bg-[#151C2C]/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E] h-20 resize-none outline-none"
            />
          </div>

          {/* Interactive controls */}
          <div className="bg-slate-900/50 p-4 border border-slate-800 rounded-2xl flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Sparkles className="text-[#4E8E5E]" size={15} />
              <span className="text-[10px] font-bold text-slate-350 uppercase tracking-wider">Event Ticket customizer</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500 font-bold uppercase">Ticket frame color</label>
                <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-850">
                  <input
                    type="color"
                    value={ticketColor}
                    onChange={(e) => setTicketColor(e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-[9px] text-slate-400 font-mono uppercase">{ticketColor}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500 font-bold uppercase">QR Corner eye style</label>
                <select
                  value={eyeStyle}
                  onChange={(e) => setEyeStyle(e.target.value as any)}
                  className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="rounded">Rounded Corners</option>
                  <option value="square">Square Blocks</option>
                  <option value="circle">Circular Dots</option>
                </select>
              </div>
            </div>
          </div>

          <QRStylingPanel settings={settings} onChange={setSettings} />
        </div>
      </div>

      {/* Output Panel with ticket mockup */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 items-center justify-between text-center min-h-[350px]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-3 w-full">Ticket Stub stub preview</h3>

          {qrUrl && (
            <div className="flex flex-col items-center gap-4 w-full">
              {/* Event Ticket Stub Mockup */}
              <div 
                className="w-full max-w-[240px] rounded-2xl overflow-hidden shadow-2xl relative border border-slate-850 flex flex-col text-left text-white"
                style={{ backgroundColor: '#090B10' }}
              >
                {/* Header Ticket color bar */}
                <div className="h-2.5 w-full" style={{ backgroundColor: ticketColor }} />
                
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      {category}
                    </span>
                    <span className="text-[9px] text-slate-450 font-semibold">{durationText}</span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold leading-tight">{title}</span>
                    <span className="text-[8px] text-slate-500 truncate">{location}</span>
                  </div>

                  {/* QR Stub display */}
                  <div 
                    className="p-2 rounded-2xl flex items-center justify-center self-center"
                    style={{ backgroundColor: settings.bgColor }}
                  >
                    <img src={qrUrl} className="w-28 h-28 block" alt="Event QR" />
                  </div>

                  {/* Countdown Timer */}
                  <div className="text-center py-1 rounded-lg bg-slate-950 border border-slate-900/60 flex items-center justify-center gap-1">
                    <Clock size={10} className="text-slate-400" />
                    <span className="text-[8px] font-bold text-slate-350">{countdownText}</span>
                  </div>
                </div>

                {/* Simulated ticket notches */}
                <div className="absolute left-0 bottom-16 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-950 border border-slate-850" />
                <div className="absolute right-0 bottom-16 translate-x-1/2 w-4 h-4 rounded-full bg-slate-950 border border-slate-850" />
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 w-full mt-2">
                <button
                  onClick={handleDownloadICS}
                  className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 bg-[#4E8E5E]/10 hover:bg-[#4E8E5E]/20 text-[#4E8E5E] border border-[#4E8E5E]/40"
                >
                  <Download size={14} />
                  <span>Download .ICS Calendar Card</span>
                </button>
                
                <a
                  href={getGoogleCalendarLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full py-2 text-xs font-bold flex items-center justify-center gap-1.5 bg-amber-950/20 hover:bg-amber-950/40 text-amber-400 border border-amber-900/40 text-center"
                >
                  <span>Add to Google Calendar</span>
                </a>

                <button 
                  onClick={() => triggerDownload(qrUrl, `event_qr.${settings.format}`)} 
                  className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Download size={15} />
                  <span>Download {settings.format.toUpperCase()}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
