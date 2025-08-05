import React from 'react';

interface AllergenIconProps {
  className?: string;
  size?: number;
}

// Gluten
export const GlutenIcon: React.FC<AllergenIconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
  </svg>
);

// Crustáceos
export const CrustaceanIcon: React.FC<AllergenIconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2c-1.1 0-2 .9-2 2v2c0 .55.45 1 1 1s1-.45 1-1V4c0-.55.45-1 1-1s1 .45 1 1v2c0 .55.45 1 1 1s1-.45 1-1V4c0-1.1-.9-2-2-2zm-6 6c-.55 0-1 .45-1 1v2c0 2.21 1.79 4 4 4h2v2c0 .55.45 1 1 1s1-.45 1-1v-2h2c2.21 0 4-1.79 4-4V9c0-.55-.45-1-1-1s-1 .45-1 1v2c0 1.1-.9 2-2 2h-6c-1.1 0-2-.9-2-2V9c0-.55-.45-1-1-1z"/>
    <circle cx="8" cy="10" r="1"/>
    <circle cx="16" cy="10" r="1"/>
  </svg>
);

// Huevos
export const EggIcon: React.FC<AllergenIconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2C8.5 2 6 6.5 6 12c0 4.5 2.5 8 6 8s6-3.5 6-8c0-5.5-2.5-10-6-10zm0 16c-2.5 0-4-2.5-4-6s1.5-8 4-8 4 3.5 4 8-1.5 6-4 6z"/>
  </svg>
);

// Pescado
export const FishIcon: React.FC<AllergenIconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2c-4 0-8 2-8 6 0 1.5.5 3 1.5 4L2 16l3.5-2C7 15.5 9.5 16 12 16s5-.5 6.5-2L22 16l-3.5-4C19.5 11 20 9.5 20 8c0-4-4-6-8-6zm-3 7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
    <path d="M16 12l2 1-2 1-1-1z"/>
  </svg>
);

// Cacahuetes
export const PeanutIcon: React.FC<AllergenIconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M8 4c-2.2 0-4 1.8-4 4 0 1.5.8 2.8 2 3.5-.5.7-.8 1.5-.8 2.5 0 2.2 1.8 4 4 4 1.5 0 2.8-.8 3.5-2 .7.5 1.5.8 2.5.8 2.2 0 4-1.8 4-4 0-1.5-.8-2.8-2-3.5.5-.7.8-1.5.8-2.5 0-2.2-1.8-4-4-4-1.5 0-2.8.8-3.5 2C9.8 4.3 9 4 8 4zm0 2c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1zm7 0c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1zM8 16c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1zm7 0c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1z"/>
  </svg>
);

// Soja
export const SoyIcon: React.FC<AllergenIconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2L8 6v4l4 4 4-4V6l-4-4zm0 2.5L14.5 7v2.5L12 12 9.5 9.5V7L12 4.5z"/>
    <circle cx="6" cy="16" r="2"/>
    <circle cx="12" cy="18" r="2"/>
    <circle cx="18" cy="16" r="2"/>
  </svg>
);

// Lácteos
export const DairyIcon: React.FC<AllergenIconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M5 3v18h14V3H5zm12 16H7V5h10v14z"/>
    <path d="M9 7v2h6V7H9zm0 4v2h6v-2H9zm0 4v2h4v-2H9z"/>
  </svg>
);

// Frutos de cáscara
export const NutsIcon: React.FC<AllergenIconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2C8.5 2 6 4.5 6 8c0 2 1 3.8 2.5 5C7 14.5 6 16.5 6 19c0 1.7 1.3 3 3 3h6c1.7 0 3-1.3 3-3 0-2.5-1-4.5-2.5-6C17 11.8 18 10 18 8c0-3.5-2.5-6-6-6zm0 2c2.5 0 4 1.5 4 4s-1.5 4-4 4-4-1.5-4-4 1.5-4 4-4zm-3 14c0-.5.5-1 1-1h4c.5 0 1 .5 1 1s-.5 1-1 1h-4c-.5 0-1-.5-1-1z"/>
  </svg>
);

// Apio
export const CeleryIcon: React.FC<AllergenIconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M7 2v20h2V12h2v10h2V8h2v14h2V4h2V2H7zm2 2h8v2H9V4zm0 4h6v2H9V8z"/>
  </svg>
);

// Mostaza
export const MustardIcon: React.FC<AllergenIconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2L8 8v4c0 2.2 1.8 4 4 4s4-1.8 4-4V8l-4-6zm0 2.5L14.5 8v4c0 1.1-.9 2-2 2s-2-.9-2-2V8L12 4.5z"/>
    <circle cx="8" cy="18" r="2"/>
    <circle cx="12" cy="20" r="2"/>
    <circle cx="16" cy="18" r="2"/>
  </svg>
);

// Sésamo
export const SesameIcon: React.FC<AllergenIconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor">
    <ellipse cx="12" cy="6" rx="3" ry="4"/>
    <ellipse cx="12" cy="18" rx="3" ry="4"/>
    <circle cx="8" cy="12" r="1.5"/>
    <circle cx="16" cy="12" r="1.5"/>
    <circle cx="10" cy="10" r="1"/>
    <circle cx="14" cy="14" r="1"/>
  </svg>
);

// Sulfitos
export const SulfiteIcon: React.FC<AllergenIconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v2h-2v-2zm0-8h2v6h-2V9z"/>
    <circle cx="12" cy="7" r="1"/>
  </svg>
);

// Altramuces
export const LupinIcon: React.FC<AllergenIconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2L6 8v8l6 6 6-6V8l-6-6zm0 3l4 4v6l-4 4-4-4V9l4-4z"/>
    <circle cx="12" cy="10" r="1"/>
    <circle cx="10" cy="12" r="1"/>
    <circle cx="14" cy="12" r="1"/>
    <circle cx="12" cy="14" r="1"/>
  </svg>
);

// Moluscos
export const MolluskIcon: React.FC<AllergenIconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2C8 2 5 5 5 9c0 2 1 4 2.5 5.5L12 19l4.5-4.5C18 13 19 11 19 9c0-4-3-7-7-7zm0 2c2.8 0 5 2.2 5 5 0 1.5-.8 3-2 4L12 16l-3-3c-1.2-1-2-2.5-2-4 0-2.8 2.2-5 5-5z"/>
    <circle cx="12" cy="9" r="2"/>
  </svg>
);

// Mapa de iconos por código de alérgeno - CORREGIDO
export const allergenIcons = {
  'GL': GlutenIcon,        // Gluten
  'CR': CrustaceanIcon,    // Crustáceos
  'EG': EggIcon,           // Huevos
  'FI': FishIcon,          // Pescado
  'PN': PeanutIcon,        // Cacahuetes
  'SO': SoyIcon,           // Soja
  'LA': DairyIcon,         // Lácteos
  'NU': NutsIcon,          // Frutos de cáscara
  'CE': CeleryIcon,        // Apio
  'MU': MustardIcon,       // Mostaza
  'SE': SesameIcon,        // Sésamo
  'SU': SulfiteIcon,       // Sulfitos
  'LU': LupinIcon,         // Altramuces
  'MO': MolluskIcon,       // Moluscos
};

export type AllergenCode = keyof typeof allergenIcons;