import { Image, FileText, QrCode, Hammer } from 'lucide-react';

interface DynamicIconProps {
  name: string;
  size?: number;
  className?: string;
}

export const DynamicIcon = ({ name, size = 20, className = '' }: DynamicIconProps) => {
  switch (name) {
    case 'Image':
      return <Image size={size} className={className} />;
    case 'FileText':
      return <FileText size={size} className={className} />;
    case 'QrCode':
      return <QrCode size={size} className={className} />;
    default:
      return <Hammer size={size} className={className} />;
  }
};
