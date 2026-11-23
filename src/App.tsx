import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckBadgeIcon,
  ContactAddIcon,
  ExternalArrowIcon,
  InstagramIcon,
  LinkedInIcon,
  MailIcon,
  PaletteIcon,
  PhoneIcon,
  PortfolioIcon,
  QrIcon,
  ShareIcon,
  TikTokIcon,
  UniversityCrestIcon,
  WhatsAppIcon,
} from './components/Icons';
import { EmailModal, QrModal, ThemeModal } from './components/Modals';
import { CardLink, getCardConfig, ThemeId } from './config/cardConfig';
import { saveContactToPhone } from './utils/vcard';

type ActiveModal = 'none' | 'email' | 'qr' | 'theme';

const VALID_THEMES: ThemeId[] = ['carbon', 'emerald', 'sapphire', 'amber'];

function renderPlatformIcon(platform: CardLink['platform']) {
  switch (platform) {
    case 'instagram':
      return <InstagramIcon className="w-5 h-5" />;
    case 'tiktok':
      return <TikTokIcon className="w-5 h-5" />;
    case 'linkedin':
      return <LinkedInIcon className="w-5 h-5" />;
    case 'portfolio':
    case 'website':
    case 'github':
    default:
      return <PortfolioIcon className="w-5 h-5" />;
  }
}

export default function App() {
  const config = useMemo(() => getCardConfig(), []);

  const [theme, setTheme] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem('nfc-card-theme') as ThemeId | null;
      if (saved && VALID_THEMES.includes(saved)) return saved;
    } catch {
      // ignore storage errors
    }
    return VALID_THEMES.includes(config.themeDefault)
      ? config.themeDefault
      : 'carbon';
  });

  const [activeModal, setActiveModal] = useState<ActiveModal>('none');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [avatarFailed, setAvatarFailed] = useState<boolean>(false);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('nfc-card-theme', theme);
    } catch {
      // ignore storage errors
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      const colorMap: Record<ThemeId, string> = {
        carbon: '#09090b',
        emerald: '#06130e',
        sapphire: '#070d17',
        amber: '#110e0c',
      };
      metaTheme.setAttribute('content', colorMap[theme]);
    }
  }, [theme]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToastMessage(message);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  }, []);

  const copyToClipboard = useCallback(
    async (text: string, label: string) => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }
        showToast(`${label} copied`);
      } catch {
        showToast(`Copy ${label.toLowerCase()} failed`);
      }
    },
    [showToast]
  );

  const handleShareCard = useCallback(async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${config.profile.fullName} — Digital Card`,
          text: `${config.profile.fullName} · ${config.profile.primaryRole} at ${config.profile.organizationFullName}`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
      }
    }
    await copyToClipboard(shareUrl, 'Card link');
  }, [config, copyToClipboard]);

  const handleSaveContact = useCallback(async () => {
    try {
      const outcome = await saveContactToPhone(config);
      if (outcome === 'downloaded') {
        showToast('Contact file downloaded (.vcf)');
      } else if (outcome === 'ios-uri') {
        showToast('Opening Contacts…');
      } else {
        showToast('Ready to save contact');
      }
    } catch {
      showToast('Could not generate contact file');
    }
  }, [config, showToast]);

  const handleSelectTheme = useCallback(
    (nextTheme: ThemeId) => {
      setTheme(nextTheme);
      setActiveModal('none');
      const label = nextTheme.charAt(0).toUpperCase() + nextTheme.slice(1);
      showToast(`${label} theme applied`);
    },
    [showToast]
  );

  const whatsappDigits = config.contact.whatsapp.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${whatsappDigits}`;
  const hasPhoto = Boolean(config.profile.avatarWebp || config.profile.avatarJpg) && !avatarFailed;

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-x-hidden">
      {/* Background Glow Layer 1: Fullscreen Radial Gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, var(--glow-color) 0%, transparent 68%)',
        }}
        aria-hidden="true"
      />

      {/* Background Glow Layer 2: Centered Top Ambient Spotlight */}
      <div
        className="fixed -top-40 left-1/2 -translate-x-1/2 w-96 h-96 blur-3xl rounded-full pointer-events-none"
        style={{ backgroundColor: 'var(--spotlight-color)' }}
        aria-hidden="true"
      />

      {/* Centered Smartphone-Capped Main Container */}
      <main className="w-full max-w-[430px] mx-auto px-5 py-6 sm:py-10 flex-1 flex flex-col justify-center items-center z-10">
        {/* 1. Top Action Bar */}
        <header className="w-full flex items-center justify-between mb-5 gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]">
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: 'var(--accent-emerald)' }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: 'var(--accent-emerald)' }}
              />
            </span>
            <span className="whitespace-nowrap">NFC Tap Verified</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveModal('theme')}
              className="min-h-[36px] px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] active:scale-95 transition flex items-center gap-1.5 text-xs font-medium text-[var(--text-primary)] cursor-pointer"
              aria-label="Choose color theme"
            >
              <PaletteIcon className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
              <span>Theme</span>
            </button>

            <button
              type="button"
              onClick={handleShareCard}
              className="min-h-[36px] px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] active:scale-95 transition flex items-center gap-1.5 text-xs font-medium text-[var(--text-primary)] cursor-pointer"
              aria-label="Share digital card"
            >
              <ShareIcon className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              <span>Share</span>
            </button>
          </div>
        </header>

        {/* 2. Profile Hero */}
        <section className="flex flex-col items-center text-center w-full mb-6">
          {/* Avatar + Animated NFC Aura Ring + Verified Badge */}
          <div className="relative mb-4">
            <div
              className="nfc-pulse-ring absolute -inset-1.5 rounded-full pointer-events-none opacity-60"
              style={{
                border: '1.5px solid var(--accent-emerald)',
              }}
              aria-hidden="true"
            />
            <div
              className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 shadow-2xl"
              style={{ background: 'var(--avatar-ring)' }}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-[var(--bg-surface)] flex items-center justify-center">
                {hasPhoto ? (
                  <picture className="w-full h-full block">
                    {config.profile.avatarWebp ? (
                      <source srcSet={config.profile.avatarWebp} type="image/webp" />
                    ) : null}
                    <img
                      src={config.profile.avatarJpg || config.profile.avatarWebp}
                      alt={config.profile.fullName}
                      className="w-full h-full object-cover object-[center_14%]"
                      referrerPolicy="no-referrer"
                      onError={() => setAvatarFailed(true)}
                    />
                  </picture>
                ) : (
                  <span
                    className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] select-none"
                    aria-label={config.profile.fullName}
                  >
                    {config.profile.initials}
                  </span>
                )}
              </div>

              <span
                className="absolute bottom-1 right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 shadow-lg"
                style={{
                  backgroundColor: 'var(--btn-primary-bg)',
                  color: 'var(--btn-primary-text)',
                  borderColor: 'var(--bg-base)',
                }}
                title="Verified Profile"
              >
                <CheckBadgeIcon className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Full Name */}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight mb-2 text-[var(--text-primary)]">
            {config.profile.fullName}
          </h1>

          {/* Dual Role Tagline */}
          <p className="text-sm sm:text-base text-[var(--text-secondary)] font-medium max-w-sm sm:max-w-md leading-relaxed mb-3">
            {config.profile.primaryRole}{' '}
            <span className="opacity-40 mx-1" aria-hidden="true">
              |
            </span>{' '}
            {config.profile.company}
          </p>

          {/* Organization Crest Pill */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] mb-3.5">
            <UniversityCrestIcon className="w-4 h-4 text-[var(--accent-emerald)] shrink-0" />
            <span className="text-[11px] font-semibold text-[var(--accent-emerald)]">
              {config.profile.organizationFullName} ({config.profile.organizationAcronym})
            </span>
          </div>

          {/* Hook Statement */}
          <p className="text-xs sm:text-sm text-[var(--text-sub)] max-w-sm leading-relaxed px-2">
            {config.profile.hookStatement}
          </p>

          {/* Focus Chips */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[11px] font-medium">
            {config.profile.focusChips.map((chip, idx) => (
              <React.Fragment key={chip}>
                <span className="px-2.5 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                  {chip}
                </span>
                {idx < config.profile.focusChips.length - 1 && (
                  <span className="opacity-40 select-none" aria-hidden="true">
                    ·
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* 3. Quick-Action Thumb Dock */}
        <section
          className="w-full grid grid-cols-4 gap-2.5 mb-6"
          aria-label="Quick Contact Actions"
        >
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] active:scale-95 transition flex flex-col items-center justify-center gap-2 group"
          >
            <span className="w-10 h-10 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-emerald)] group-hover:scale-105 transition-transform">
              <WhatsAppIcon className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-semibold text-[var(--text-primary)]">
              WhatsApp
            </span>
          </a>

          <a
            href={`tel:${config.contact.phone}`}
            className="p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] active:scale-95 transition flex flex-col items-center justify-center gap-2 group"
          >
            <span className="w-10 h-10 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-emerald)] group-hover:scale-105 transition-transform">
              <PhoneIcon className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-semibold text-[var(--text-primary)]">
              Call
            </span>
          </a>

          <button
            type="button"
            onClick={() => setActiveModal('email')}
            className="p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] active:scale-95 transition flex flex-col items-center justify-center gap-2 group cursor-pointer"
          >
            <span className="w-10 h-10 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-emerald)] group-hover:scale-105 transition-transform">
              <MailIcon className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-semibold text-[var(--text-primary)]">
              Email
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModal('qr')}
            className="p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] active:scale-95 transition flex flex-col items-center justify-center gap-2 group cursor-pointer"
          >
            <span className="w-10 h-10 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-emerald)] group-hover:scale-105 transition-transform">
              <QrIcon className="w-5 h-5" />
            </span>
            <span className="text-[11px] font-semibold text-[var(--text-primary)]">
              QR Code
            </span>
          </button>
        </section>

        {/* 4. Primary CTA */}
        <div className="w-full mb-6">
          <button
            type="button"
            onClick={handleSaveContact}
            className="w-full h-14 rounded-2xl font-bold text-sm sm:text-base shadow-xl hover:opacity-90 active:scale-[0.98] transition flex items-center justify-center gap-2.5 cursor-pointer"
            style={{
              backgroundColor: 'var(--btn-primary-bg)',
              color: 'var(--btn-primary-text)',
            }}
          >
            <ContactAddIcon className="w-5 h-5" />
            <span>Save Contact to Phone</span>
          </button>
        </div>

        {/* 5. Portfolio & Social Profiles Section */}
        <section className="w-full" aria-label="Portfolio and Social Profiles">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-sub)] pl-1 mb-2.5">
            Portfolio &amp; Social Profiles
          </h2>

          <div className="space-y-3 mb-6">
            {config.links.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-card w-full p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shrink-0 p-1 flex items-center justify-center text-[var(--accent-emerald)]">
                    {renderPlatformIcon(item.platform)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                      {item.title}
                    </div>
                    <div className="text-xs text-[var(--text-sub)] truncate">
                      {item.subtitle}
                    </div>
                  </div>
                </div>
                <ExternalArrowIcon className="w-4 h-4 text-[var(--text-sub)] group-hover:text-[var(--text-primary)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition shrink-0" />
              </a>
            ))}
          </div>
        </section>

        {/* 6. Quick-Copy Strip */}
        <div className="w-full pt-5 border-t border-[var(--border-subtle)] flex items-center justify-around text-xs text-[var(--text-sub)]">
          <button
            type="button"
            onClick={() => copyToClipboard(config.contact.email, 'Email')}
            className="min-h-[36px] px-2 hover:text-[var(--text-primary)] active:scale-95 transition cursor-pointer"
          >
            Copy Email
          </button>
          <span className="opacity-30 select-none" aria-hidden="true">
            ·
          </span>
          <button
            type="button"
            onClick={() => copyToClipboard(config.contact.phoneDisplay, 'Phone')}
            className="min-h-[36px] px-2 hover:text-[var(--text-primary)] active:scale-95 transition cursor-pointer"
          >
            Copy Phone
          </button>
          <span className="opacity-30 select-none" aria-hidden="true">
            ·
          </span>
          <button
            type="button"
            onClick={() => copyToClipboard(window.location.href, 'Link')}
            className="min-h-[36px] px-2 hover:text-[var(--text-primary)] active:scale-95 transition cursor-pointer"
          >
            Copy Link
          </button>
        </div>
      </main>

      {/* 7. Footer */}
      <footer className="w-full text-center py-6 text-xs text-zinc-600 font-medium z-10">
        {config.footer.name} © {config.footer.year} · {config.footer.tagline}
      </footer>

      {/* Modals */}
      <QrModal
        isOpen={activeModal === 'qr'}
        onClose={() => setActiveModal('none')}
        fullName={config.profile.fullName}
        onCopyLink={() => copyToClipboard(window.location.href, 'Card link')}
      />

      <EmailModal
        isOpen={activeModal === 'email'}
        onClose={() => setActiveModal('none')}
        email={config.contact.email}
        fullName={config.profile.fullName}
        onCopyEmail={() => copyToClipboard(config.contact.email, 'Email')}
      />

      <ThemeModal
        isOpen={activeModal === 'theme'}
        onClose={() => setActiveModal('none')}
        activeTheme={theme}
        onSelectTheme={handleSelectTheme}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="fixed bottom-6 left-1/2 z-50 toast-enter bg-zinc-100 text-zinc-900 px-4 py-2.5 rounded-full text-xs font-semibold shadow-2xl whitespace-nowrap"
          role="status"
          aria-live="polite"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
