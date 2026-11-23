export type ThemeId = 'carbon' | 'emerald' | 'sapphire' | 'amber';

export interface CardLink {
  id: string;
  platform: 'instagram' | 'tiktok' | 'linkedin' | 'portfolio' | 'website' | 'github';
  title: string;
  subtitle: string;
  url: string;
}

export interface CardConfig {
  themeDefault: ThemeId;
  profile: {
    fullName: string;
    initials: string;
    avatarWebp?: string;
    avatarJpg?: string;
    primaryRole: string;
    company: string;
    secondaryAffiliation?: string;
    organizationFullName: string;
    organizationAcronym: string;
    hookStatement: string;
    focusChips: string[];
  };
  contact: {
    whatsapp: string;
    phone: string;
    phoneDisplay: string;
    email: string;
  };
  links: CardLink[];
  footer: {
    name: string;
    year: string;
    tagline: string;
  };
}

export interface ThemeOption {
  id: ThemeId;
  name: string;
  subtitle: string;
  baseHex: string;
  surfaceHex: string;
  accentHex: string;
  secondaryHex: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'carbon',
    name: 'Carbon',
    subtitle: 'Obsidian & Crisp White',
    baseHex: '#09090b',
    surfaceHex: '#18181b',
    accentHex: '#ffffff',
    secondaryHex: '#a1a1aa',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    subtitle: 'Forest & Gold',
    baseHex: '#06130e',
    surfaceHex: '#0e271f',
    accentHex: '#10b981',
    secondaryHex: '#f59e0b',
  },
  {
    id: 'sapphire',
    name: 'Sapphire',
    subtitle: 'Midnight & Sky',
    baseHex: '#070d17',
    surfaceHex: '#112137',
    accentHex: '#38bdf8',
    secondaryHex: '#818cf8',
  },
  {
    id: 'amber',
    name: 'Amber',
    subtitle: 'Espresso & Warm Gold',
    baseHex: '#110e0c',
    surfaceHex: '#271f1a',
    accentHex: '#f59e0b',
    secondaryHex: '#fbbf24',
  },
];

const FALLBACK_CONFIG: CardConfig = {
  themeDefault: 'carbon',
  profile: {
    fullName: 'Tobias Kanja',
    initials: 'TK',
    avatarWebp: '',
    avatarJpg: '',
    primaryRole: 'Bachelor of Information Technology',
    company: 'Meru University',
    secondaryAffiliation: 'School of Computing & Informatics',
    organizationFullName: 'Meru University of Science & Technology',
    organizationAcronym: 'MUST',
    hookStatement:
      'Building responsive web experiences, clean UI systems, and mobile applications at Meru University of Science & Technology.',
    focusChips: ['Web Development', 'UI Design', 'Mobile Apps'],
  },
  contact: {
    whatsapp: '+254142987767',
    phone: '+254142987767',
    phoneDisplay: '0142987767',
    email: 'Murimitobias@gmail.com',
  },
  links: [
    {
      id: 'instagram',
      platform: 'instagram',
      title: 'Instagram',
      subtitle: '@tobiaskanjaofficial · Visuals & Updates',
      url: 'https://www.instagram.com/tobiaskanjaofficial/',
    },
    {
      id: 'tiktok',
      platform: 'tiktok',
      title: 'TikTok',
      subtitle: '@tobiaskanjaofficial · Tech & Campus Clips',
      url: 'https://www.tiktok.com/@tobiaskanjaofficial',
    },
    {
      id: 'linkedin',
      platform: 'linkedin',
      title: 'LinkedIn',
      subtitle: 'Tobias Kanja · MUST IT & Professional Network',
      url: 'https://www.linkedin.com/in/tobiaskanjaofficial',
    },
    {
      id: 'portfolio',
      platform: 'portfolio',
      title: 'Portfolio',
      subtitle: 'Web Development, UI Design & Mobile Apps',
      url: 'https://github.com/tobiaskanjaofficial',
    },
  ],
  footer: {
    name: 'Tobias Kanja',
    year: '2026',
    tagline: 'Tap to Connect',
  },
};

declare global {
  interface Window {
    CARD_CONFIG?: Partial<CardConfig>;
    DEFAULT_CARD_CONFIG?: Partial<CardConfig>;
  }
}

export function getCardConfig(): CardConfig {
  const source =
    (typeof window !== 'undefined' && (window.CARD_CONFIG || window.DEFAULT_CARD_CONFIG)) ||
    FALLBACK_CONFIG;

  return {
    themeDefault: source.themeDefault || FALLBACK_CONFIG.themeDefault,
    profile: {
      ...FALLBACK_CONFIG.profile,
      ...(source.profile || {}),
      focusChips:
        source.profile?.focusChips && source.profile.focusChips.length > 0
          ? source.profile.focusChips
          : FALLBACK_CONFIG.profile.focusChips,
    },
    contact: {
      ...FALLBACK_CONFIG.contact,
      ...(source.contact || {}),
    },
    links:
      source.links && source.links.length > 0 ? source.links : FALLBACK_CONFIG.links,
    footer: {
      ...FALLBACK_CONFIG.footer,
      ...(source.footer || {}),
    },
  };
}
