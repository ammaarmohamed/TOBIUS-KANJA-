import React, { useEffect, useState } from 'react';
import { THEME_OPTIONS, ThemeId } from '../config/cardConfig';
import { CloseIcon, CopyIcon, ExternalArrowIcon, MailIcon, PaletteIcon, QrIcon } from './Icons';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  fullName: string;
  onCopyLink: () => void;
}

export const QrModal: React.FC<QrModalProps> = ({
  isOpen,
  onClose,
  fullName,
  onCopyLink,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrError, setQrError] = useState<boolean>(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    const generate = async () => {
      try {
        setQrError(false);
        const QRCode = await import('qrcode');
        const url = window.location.href;
        const dataUrl = await QRCode.toDataURL(url, {
          width: 180,
          margin: 1,
          color: {
            dark: '#09090b',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'M',
        });
        if (!cancelled) {
          setQrDataUrl(dataUrl);
        }
      } catch {
        if (!cancelled) {
          setQrError(true);
        }
      }
    };

    generate();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
    >
      <div
        className="rounded-3xl p-6 max-w-[340px] w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
            <QrIcon className="w-4 h-4 text-[var(--accent-emerald)]" />
            <span id="qr-modal-title">Scan Digital Card</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close QR modal"
            className="w-9 h-9 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-sub)] hover:text-[var(--text-primary)] active:scale-95 transition cursor-pointer"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[var(--text-sub)] mb-4">
          Point any smartphone camera to open {fullName}&apos;s live NFC card.
        </p>

        <div className="inline-flex items-center justify-center bg-white p-3.5 rounded-2xl shadow-inner mb-4">
          {qrDataUrl && !qrError ? (
            <img
              src={qrDataUrl}
              alt={`QR code for ${fullName}`}
              width={180}
              height={180}
              className="w-[180px] h-[180px] block rounded-lg"
            />
          ) : (
            <div className="w-[180px] h-[180px] flex items-center justify-center text-xs font-medium text-zinc-500">
              {qrError ? 'Unable to render QR' : 'Generating QR…'}
            </div>
          )}
        </div>

        <p className="text-[11px] font-mono text-[var(--text-sub)] truncate px-2 mb-4 select-all">
          {currentUrl}
        </p>

        <button
          type="button"
          onClick={onCopyLink}
          className="w-full h-11 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition cursor-pointer"
          style={{
            backgroundColor: 'var(--btn-primary-bg)',
            color: 'var(--btn-primary-text)',
          }}
        >
          <CopyIcon className="w-3.5 h-3.5" />
          Copy Card Link
        </button>
      </div>
    </div>
  );
};

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  fullName: string;
  onCopyEmail: () => void;
}

export const EmailModal: React.FC<EmailModalProps> = ({
  isOpen,
  onClose,
  email,
  fullName,
  onCopyEmail,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    email
  )}&su=${encodeURIComponent(`Hello ${fullName}`)}`;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-modal-title"
    >
      <div
        className="rounded-3xl p-6 max-w-[340px] w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
            <MailIcon className="w-4 h-4 text-[var(--accent-emerald)]" />
            <span id="email-modal-title">Direct Email</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close email modal"
            className="w-9 h-9 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-sub)] hover:text-[var(--text-primary)] active:scale-95 transition cursor-pointer"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[var(--text-sub)] mb-3">
          Reach out to {fullName} directly via email:
        </p>

        <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] mb-4 text-center">
          <span className="font-mono text-xs sm:text-sm text-[var(--text-primary)] select-all break-all">
            {email}
          </span>
        </div>

        <div className="space-y-2.5">
          <a
            href={gmailComposeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-11 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition"
            style={{
              backgroundColor: 'var(--btn-primary-bg)',
              color: 'var(--btn-primary-text)',
            }}
          >
            <span>Compose in Gmail Web</span>
            <ExternalArrowIcon className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={onCopyEmail}
            className="w-full h-11 rounded-xl font-semibold text-xs bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] flex items-center justify-center gap-2 active:scale-[0.98] transition cursor-pointer"
          >
            <CopyIcon className="w-3.5 h-3.5" />
            <span>Copy Email Address</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  activeTheme,
  onSelectTheme,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="theme-modal-title"
    >
      <div
        className="rounded-3xl p-6 max-w-[340px] w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
            <PaletteIcon className="w-4 h-4 text-[var(--accent-gold)]" />
            <span id="theme-modal-title">Card Theme</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close theme modal"
            className="w-9 h-9 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-sub)] hover:text-[var(--text-primary)] active:scale-95 transition cursor-pointer"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          {THEME_OPTIONS.map((option) => {
            const isActive = option.id === activeTheme;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onSelectTheme(option.id)}
                className="w-full p-3.5 rounded-2xl bg-[var(--bg-card)] border transition flex items-center justify-between gap-3 active:scale-[0.98] cursor-pointer text-left"
                style={{
                  borderColor: isActive
                    ? 'var(--border-hover)'
                    : 'var(--border-subtle)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/15 shrink-0"
                    style={{ backgroundColor: option.baseHex }}
                  >
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{
                        background: `linear-gradient(135deg, ${option.accentHex} 0%, ${option.secondaryHex} 100%)`,
                      }}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">
                      {option.name}
                    </div>
                    <div className="text-xs text-[var(--text-sub)]">
                      {option.subtitle}
                    </div>
                  </div>
                </div>
                <span
                  className="text-sm font-bold leading-none shrink-0"
                  style={{
                    color: isActive ? 'var(--accent-emerald)' : 'transparent',
                  }}
                  aria-label={isActive ? 'Active theme' : undefined}
                >
                  ●
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
