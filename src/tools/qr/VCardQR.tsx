import { triggerDownload, generateDesignedQR } from '../../utils/sharedHelpers';
import { useState, useEffect } from 'react';
import { User, Download, ShieldAlert, Sparkles, Globe, Mail, Phone, MapPin } from 'lucide-react';
import { QRStylingPanel } from '../../components/QRStylingPanel';
import type { QRStyleSettings } from '../../components/QRStylingPanel';

type ProfileTheme = 'corporate' | 'creative' | 'casual';

export const VCardQRTool = () => {
  // Original states
  const [firstName, setFirstName] = useState('Arron Kian');
  const [lastName, setLastName] = useState('Parejas');
  const [phone, setPhone] = useState('+6391234567');
  const [email, setEmail] = useState('arron@domain.com');
  const [org, setOrg] = useState('DomoDomo Inc');
  const [url, setUrl] = useState('https://github.com/arronkianparejas');
  
  // Expanded fields
  const [jobTitle, setJobTitle] = useState('Lead Software Engineer');
  const [address, setAddress] = useState('Manila, Philippines');
  const [notes, setNotes] = useState('DomoDomo tool designer.');
  const [linkedin, setLinkedin] = useState('https://linkedin.com/in/arron');
  const [github, setGithub] = useState('https://github.com/arronkianparejas');
  
  // Custom Controls (10 Features)
  const [vcardVersion, setVcardVersion] = useState<'3.0' | '4.0' | '2.1'>('3.0');
  const [profileTheme, setProfileTheme] = useState<ProfileTheme>('creative');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [enabledFields, setEnabledFields] = useState<Record<string, boolean>>({
    name: true,
    phone: true,
    email: true,
    org: true,
    title: true,
    address: true,
    url: true,
    socials: true,
    notes: true
  });
  
  const [eyeStyle, setEyeStyle] = useState<'square' | 'rounded' | 'leaf'>('rounded');
  const [qrUrl, setQrUrl] = useState('');
  const [payloadSize, setPayloadSize] = useState(0);

  const [settings, setSettings] = useState<QRStyleSettings>({
    fgColor: '#4E8E5E',
    bgColor: '#0B0F19',
    margin: 2,
    errorCorrection: 'M', // Medium is standard for vCard to handle density
    size: 400,
    format: 'png',
    logoPreset: 'none',
    theme: 'emerald'
  });

  const getVCardPayload = () => {
    let payload = 'BEGIN:VCARD\n';
    payload += `VERSION:${vcardVersion}\n`;
    
    if (enabledFields.name) {
      payload += `N:${lastName};${firstName};;;\n`;
      payload += `FN:${firstName} ${lastName}\n`;
    }
    if (enabledFields.phone && phone) {
      payload += `TEL;TYPE=CELL:${phone}\n`;
    }
    if (enabledFields.email && email) {
      payload += `EMAIL;TYPE=PREF,INTERNET:${email}\n`;
    }
    if (enabledFields.org && org) {
      payload += `ORG:${org}\n`;
    }
    if (enabledFields.title && jobTitle) {
      payload += `TITLE:${jobTitle}\n`;
    }
    if (enabledFields.address && address) {
      payload += `ADR;TYPE=WORK:;;${address.replace(/,/g, '\\,')};;;;\n`;
    }
    if (enabledFields.url && url) {
      payload += `URL:${url}\n`;
    }
    if (enabledFields.socials) {
      if (linkedin) payload += `X-SOCIALPROFILE;TYPE=linkedin:${linkedin}\n`;
      if (github) payload += `X-SOCIALPROFILE;TYPE=github:${github}\n`;
    }
    if (enabledFields.notes && notes) {
      payload += `NOTE:${notes}\n`;
    }
    
    payload += 'END:VCARD';
    return payload;
  };

  const generate = async () => {
    try {
      const vcard = getVCardPayload();
      setPayloadSize(vcard.length);
      const url = await generateDesignedQR(vcard, {
        ...settings,
        eyeFrameStyle: eyeStyle,
        eyeBallStyle: eyeStyle === 'leaf' ? 'diamond' : (eyeStyle === 'rounded' ? 'circle' : 'square'),
        customLogoUrl: profilePhoto,
        logoScale: 0.22,
        logoMask: true
      });
      setQrUrl(url);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    generate();
  }, [
    firstName, lastName, phone, email, org, url, jobTitle, address, notes, linkedin, github,
    vcardVersion, profilePhoto, enabledFields, eyeStyle, settings
  ]);

  // VCF Import parser
  const handleVcfImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (!text) return;
        
        // Simple VCF Parsing
        const lines = text.split(/\r?\n/);
        lines.forEach(line => {
          const parts = line.split(':');
          if (parts.length >= 2) {
            const key = parts[0].split(';')[0].toUpperCase();
            const val = parts.slice(1).join(':').trim();
            
            if (key === 'FN') {
              const names = val.split(' ');
              setFirstName(names[0] || '');
              setLastName(names.slice(1).join(' ') || '');
            } else if (key === 'N') {
              const names = val.split(';');
              setLastName(names[0] || '');
              setFirstName(names[1] || '');
            } else if (key === 'TEL') {
              setPhone(val);
            } else if (key === 'EMAIL') {
              setEmail(val);
            } else if (key === 'URL') {
              setUrl(val);
            } else if (key === 'ORG') {
              setOrg(val);
            } else if (key === 'TITLE') {
              setJobTitle(val);
            } else if (key === 'NOTE') {
              setNotes(val);
            }
          }
        });
      };
      reader.readAsText(file);
    }
  };

  // Direct VCF exporter
  const handleVcfDownload = () => {
    const vcard = getVCardPayload();
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `${firstName.toLowerCase()}_${lastName.toLowerCase()}.vcf`);
    URL.revokeObjectURL(url);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setProfilePhoto(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleField = (field: string) => {
    setEnabledFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Warning thresholds for byte size
  const maxSafeBytes = 220;
  const isHighDensity = payloadSize > maxSafeBytes;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      {/* Settings Panel */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white flex items-center gap-2 text-lg">
              <User className="text-[#4E8E5E]" size={20} />
              <span>vCard Contact QR Generator</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Business Card Suite</span>
          </div>

          {/* VCF Import and Profile Photo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/20 p-3 rounded-2xl border border-slate-850">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-slate-400 font-bold uppercase">Import .vcf Contact Card</label>
              <label className="btn-secondary cursor-pointer py-1.5 px-3 text-[11px] rounded-lg text-center w-full">
                <span>Upload VCF File</span>
                <input type="file" accept=".vcf" onChange={handleVcfImport} className="hidden" />
              </label>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-slate-400 font-bold uppercase">Logo Profile Photo (Overlay center)</label>
              <label className="btn-secondary cursor-pointer py-1.5 px-3 text-[11px] rounded-lg text-center w-full">
                <span>Upload Profile Photo</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Core Fields Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold flex items-center justify-between">
                <span>First Name</span>
                <input type="checkbox" checked={enabledFields.name} onChange={() => toggleField('name')} className="w-3.5 h-3.5 rounded text-[#4E8E5E] focus:ring-0 cursor-pointer" />
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold flex items-center justify-between">
                <span>Last Name</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold flex items-center justify-between">
                <span>Phone / Cell</span>
                <input type="checkbox" checked={enabledFields.phone} onChange={() => toggleField('phone')} className="w-3.5 h-3.5 rounded text-[#4E8E5E] focus:ring-0 cursor-pointer" />
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold flex items-center justify-between">
                <span>Email Address</span>
                <input type="checkbox" checked={enabledFields.email} onChange={() => toggleField('email')} className="w-3.5 h-3.5 rounded text-[#4E8E5E] focus:ring-0 cursor-pointer" />
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold flex items-center justify-between">
                <span>Company Organization</span>
                <input type="checkbox" checked={enabledFields.org} onChange={() => toggleField('org')} className="w-3.5 h-3.5 rounded text-[#4E8E5E] focus:ring-0 cursor-pointer" />
              </label>
              <input
                type="text"
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold flex items-center justify-between">
                <span>Job Title</span>
                <input type="checkbox" checked={enabledFields.title} onChange={() => toggleField('title')} className="w-3.5 h-3.5 rounded text-[#4E8E5E] focus:ring-0 cursor-pointer" />
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
              />
            </div>
          </div>

          {/* Expanded parameters (Address, Notes, Socials) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold flex items-center justify-between">
                <span>Physical Address</span>
                <input type="checkbox" checked={enabledFields.address} onChange={() => toggleField('address')} className="w-3.5 h-3.5 rounded text-[#4E8E5E] focus:ring-0 cursor-pointer" />
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold flex items-center justify-between">
                <span>Website URL</span>
                <input type="checkbox" checked={enabledFields.url} onChange={() => toggleField('url')} className="w-3.5 h-3.5 rounded text-[#4E8E5E] focus:ring-0 cursor-pointer" />
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold flex items-center justify-between">
                <span>GitHub Profile URL</span>
                <input type="checkbox" checked={enabledFields.socials} onChange={() => toggleField('socials')} className="w-3.5 h-3.5 rounded text-[#4E8E5E] focus:ring-0 cursor-pointer" />
              </label>
              <input
                type="text"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold flex items-center justify-between">
                <span>LinkedIn URL</span>
              </label>
              <input
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-semibold flex items-center justify-between">
              <span>Bio Notes / Summary</span>
              <input type="checkbox" checked={enabledFields.notes} onChange={() => toggleField('notes')} className="w-3.5 h-3.5 rounded text-[#4E8E5E] focus:ring-0 cursor-pointer" />
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
            />
          </div>

          {/* Style Customization Drawer */}
          <div className="bg-slate-900/50 p-4 border border-slate-800 rounded-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="text-[#4E8E5E]" size={15} />
                <span className="text-[10px] font-bold text-slate-350 uppercase tracking-wider">Visual Customizer</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500 font-bold uppercase">vCard Specification</label>
                <select
                  value={vcardVersion}
                  onChange={(e) => setVcardVersion(e.target.value as any)}
                  className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="3.0">vCard 3.0 (Recommended)</option>
                  <option value="4.0">vCard 4.0 (Modern)</option>
                  <option value="2.1">vCard 2.1 (Legacy Compatibility)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500 font-bold uppercase">Profile mockup Theme</label>
                <select
                  value={profileTheme}
                  onChange={(e) => setProfileTheme(e.target.value as any)}
                  className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="creative">Creative Emerald</option>
                  <option value="corporate">Slate Corporate</option>
                  <option value="casual">Warm Amber</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500 font-bold uppercase">QR Eye Corner style</label>
                <select
                  value={eyeStyle}
                  onChange={(e) => setEyeStyle(e.target.value as any)}
                  className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="rounded">Rounded Corners</option>
                  <option value="square">Standard Squares</option>
                  <option value="leaf">Symmetric Leaves</option>
                </select>
              </div>
            </div>
          </div>

          <QRStylingPanel settings={settings} onChange={setSettings} />
        </div>
      </div>

      {/* Output Panel with smartphone mockup */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 items-center justify-between text-center min-h-[350px]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-3 w-full">Contact Card Output</h3>

          {qrUrl && (
            <div className="flex flex-col items-center gap-4 w-full">
              {/* Smartphone Mockup */}
              <div className="w-full max-w-[240px] border-4 border-slate-850 rounded-[30px] p-3.5 bg-slate-950 text-slate-300 shadow-2xl relative text-left flex flex-col gap-3">
                {/* Speaker slit */}
                <div className="w-12 h-1 bg-slate-800 rounded-full mx-auto mb-2" />

                {/* Profile Header section */}
                <div className={`p-3 rounded-2xl flex flex-col items-center text-center gap-1.5 ${
                  profileTheme === 'creative' ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/30' :
                  profileTheme === 'corporate' ? 'bg-slate-900 text-slate-200 border border-slate-800' :
                  'bg-amber-950/20 text-amber-400 border border-amber-900/30'
                }`}>
                  {profilePhoto ? (
                    <img src={profilePhoto} className="w-11 h-11 rounded-full object-cover border border-slate-800" alt="Avatar" />
                  ) : (
                    <div className="p-2.5 bg-slate-900/80 rounded-full border border-slate-800 text-slate-400">
                      <User size={18} />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-white leading-tight">{firstName} {lastName}</span>
                    <span className="text-[8px] text-slate-400 leading-tight">{jobTitle} at {org}</span>
                  </div>
                </div>

                {/* Mock Card attributes list */}
                <div className="flex flex-col gap-2 text-[8px] text-slate-400 font-medium px-1">
                  {phone && <div className="flex items-center gap-1.5"><Phone size={8} className="text-slate-500" /><span>{phone}</span></div>}
                  {email && <div className="flex items-center gap-1.5"><Mail size={8} className="text-slate-500" /><span>{email}</span></div>}
                  {address && <div className="flex items-center gap-1.5"><MapPin size={8} className="text-slate-500" /><span>{address}</span></div>}
                  {url && <div className="flex items-center gap-1.5"><Globe size={8} className="text-slate-500" /><span>{url}</span></div>}
                </div>

                {/* Encoded QR Code display */}
                <div 
                  className="p-2 rounded-2xl flex items-center justify-center self-center"
                  style={{ backgroundColor: settings.bgColor }}
                >
                  <img src={qrUrl} className="w-28 h-28 block" alt="vCard QR" />
                </div>
              </div>

              {/* Density and payload tracking progress bar */}
              <div className="w-full bg-slate-950/40 p-2.5 border border-slate-850 rounded-xl text-left flex flex-col gap-1.5">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-450">
                  <span>Data Density Weight</span>
                  <span className={isHighDensity ? 'text-amber-400' : 'text-emerald-400'}>{payloadSize} / {maxSafeBytes} Bytes</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${isHighDensity ? 'bg-amber-400' : 'bg-[#4E8E5E]'}`}
                    style={{ width: `${Math.min(100, (payloadSize / maxSafeBytes) * 100)}%` }}
                  />
                </div>
                {isHighDensity && (
                  <div className="text-[8px] text-slate-500 leading-normal flex items-start gap-1">
                    <ShieldAlert size={9} className="shrink-0 mt-0.5" />
                    <span>Heavy QR density. Disable some fields or reduce bio text lengths for faster scanning.</span>
                  </div>
                )}
              </div>

              {/* Actions list */}
              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={handleVcfDownload}
                  className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 bg-[#4E8E5E]/10 hover:bg-[#4E8E5E]/20 text-[#4E8E5E] border border-[#4E8E5E]/40"
                >
                  <Download size={14} />
                  <span>Download .VCF Contact File</span>
                </button>
                
                <button
                  onClick={() => triggerDownload(qrUrl, `vcard_qr.${settings.format}`)}
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
