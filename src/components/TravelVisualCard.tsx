import React from 'react';
import { Mountain, Utensils, Palmtree, Compass, Landmark, Sparkles } from 'lucide-react';

interface TravelVisualCardProps {
  theme: 'nature' | 'culture' | 'culinary' | 'coast' | 'family' | 'hero';
  title?: string;
  className?: string;
}

export const TravelVisualCard: React.FC<TravelVisualCardProps> = ({ theme, title, className = '' }) => {
  if (theme === 'hero') {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white ${className}`}>
        {/* Subtle decorative mountain vector backdrop */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg viewBox="0 0 1200 400" preserveAspectRatio="none" className="w-full h-full fill-white">
            <path d="M0,400 L200,240 L380,310 L560,180 L760,280 L940,150 L1100,270 L1200,210 L1200,400 Z" opacity="0.4" />
            <path d="M0,400 L120,300 L300,340 L500,240 L680,320 L860,220 L1040,310 L1200,260 L1200,400 Z" opacity="0.6" />
          </svg>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>
    );
  }

  // Visual card styles per theme
  const configs = {
    nature: {
      gradient: 'from-emerald-800 via-teal-900 to-stone-900',
      accentGlow: 'bg-emerald-500/20',
      icon: Mountain,
      label: 'טבע, הרים ואגמים',
      svgPath: 'M0,160 L80,90 L160,130 L260,60 L360,110 L440,70 L500,120 L500,160 Z',
    },
    culture: {
      gradient: 'from-amber-900 via-stone-800 to-stone-900',
      accentGlow: 'bg-amber-500/20',
      icon: Landmark,
      label: 'היסטוריה, תרבות וסמטאות',
      svgPath: 'M0,160 L60,120 L120,120 L150,80 L180,80 L210,120 L270,120 L320,70 L370,120 L440,120 L500,160 Z',
    },
    culinary: {
      gradient: 'from-orange-900 via-amber-900 to-stone-900',
      accentGlow: 'bg-orange-500/20',
      icon: Utensils,
      label: 'קולינריה, יין ושווקים',
      svgPath: 'M0,160 L100,130 L200,145 L320,115 L420,135 L500,120 L500,160 Z',
    },
    coast: {
      gradient: 'from-sky-900 via-cyan-950 to-stone-900',
      accentGlow: 'bg-cyan-500/20',
      icon: Palmtree,
      label: 'חופים, שלווה ורוגע',
      svgPath: 'M0,160 C150,140 250,170 380,135 C440,120 480,140 500,160 Z',
    },
    family: {
      gradient: 'from-indigo-900 via-slate-900 to-stone-900',
      accentGlow: 'bg-indigo-500/20',
      icon: Sparkles,
      label: 'אטרקציות, כיף ומשפחה',
      svgPath: 'M0,160 L90,110 L180,130 L270,80 L370,120 L460,90 L500,160 Z',
    },
  };

  const current = configs[theme] || configs.nature;
  const Icon = current.icon;

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${current.gradient} text-white flex flex-col justify-end p-5 select-none ${className}`}>
      {/* Background landscape contour */}
      <div className="absolute inset-0 opacity-25 pointer-events-none">
        <svg viewBox="0 0 500 160" preserveAspectRatio="none" className="w-full h-full fill-white">
          <path d={current.svgPath} />
        </svg>
      </div>
      
      {/* Soft color glow */}
      <div className={`absolute top-0 right-0 w-48 h-48 ${current.accentGlow} rounded-full blur-2xl pointer-events-none`} />

      {/* Floating gentle icon badge */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/15">
            <Icon className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-medium text-stone-200">{current.label}</span>
        </div>
        {title && <span className="text-xs text-stone-300 font-light truncate max-w-[140px]">{title}</span>}
      </div>
    </div>
  );
};
