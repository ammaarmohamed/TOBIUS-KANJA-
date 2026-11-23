import { CardConfig } from '../config/cardConfig';

function escapeVCardValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

export function buildVCard30(config: CardConfig, pageUrl: string): string {
  const nameParts = config.profile.fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || config.profile.fullName;
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${escapeVCardValue(lastName)};${escapeVCardValue(firstName)};;;`,
    `FN:${escapeVCardValue(config.profile.fullName)}`,
    `ORG:${escapeVCardValue(config.profile.organizationFullName)}`,
    `TITLE:${escapeVCardValue(`${config.profile.primaryRole} (${config.profile.organizationAcronym})`)}`,
    `TEL;TYPE=CELL,VOICE:${config.contact.phone}`,
    `EMAIL;TYPE=INTERNET,PREF:${config.contact.email}`,
    `URL:${pageUrl}`,
  ];

  for (const link of config.links) {
    const typeLabel = link.platform.toLowerCase();
    lines.push(`X-SOCIALPROFILE;TYPE=${typeLabel}:${link.url}`);
  }

  const noteText = `${config.profile.hookStatement} Focus: ${config.profile.focusChips.join(', ')}.`;
  lines.push(`NOTE:${escapeVCardValue(noteText)}`);
  lines.push('END:VCARD');

  return lines.join('\r\n');
}

export async function saveContactToPhone(
  config: CardConfig
): Promise<'shared' | 'ios-uri' | 'downloaded'> {
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const vcfContent = buildVCard30(config, pageUrl);
  const fileSlug = config.profile.fullName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const filename = `${fileSlug || 'contact'}.vcf`;

  // 1. Try native OS share sheet with .vcf file (iOS/Android Contacts importer)
  if (typeof navigator !== 'undefined' && typeof File !== 'undefined') {
    try {
      const vcfFile = new File([vcfContent], filename, {
        type: 'text/vcard;charset=utf-8',
      });
      if (navigator.canShare && navigator.canShare({ files: [vcfFile] })) {
        await navigator.share({
          files: [vcfFile],
          title: config.profile.fullName,
          text: `${config.profile.fullName} — ${config.profile.primaryRole}`,
        });
        return 'shared';
      }
    } catch (err) {
      // If user canceled native share sheet, bubble cancellation silently by returning shared
      if (err instanceof DOMException && err.name === 'AbortError') {
        return 'shared';
      }
    }
  }

  // 2. iOS Safari fallback via data:text/vcard URI
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (isIOS) {
    const dataUri = `data:text/vcard;charset=utf-8,${encodeURIComponent(vcfContent)}`;
    window.location.href = dataUri;
    return 'ios-uri';
  }

  // 3. Android / Desktop Blob download fallback
  const blob = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = blobUrl;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
  return 'downloaded';
}
