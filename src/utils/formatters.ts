import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Formate une durée en secondes
 * @param seconds - Durée en secondes
 * @param formatType - 'short': MM:SS (ex: 3:45), 'long': Xh Xm (ex: 1h 3m)
 */
export function formatDuration(seconds: number, formatType: 'short' | 'long' = 'short'): string {
  if (!Number.isFinite(seconds) || isNaN(seconds)) return '0:00';

  if (formatType === 'short') {
    // Format court: MM:SS
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    // Format long: Xh Xm Xs
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    } else if (mins > 0) {
      return `${mins}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }
}

/**
 * Formate une date en chaîne lisible
 * @param date - Date en ISO string ou objet Date
 * @param includeTime - Si true, inclut l'heure (ex: "15 mars 2026 14:30")
 */
export function formatDate(date: string | Date, includeTime = false): string {
  if (!date) return '-';

  try {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    return format(parsed, includeTime ? 'PPp' : 'PPP', { locale: fr });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
}

/**
 * Formate un pourcentage
 * @param value - Valeur numérique
 * @param decimals - Nombre de décimales (défaut: 1)
 */
export function formatPercentage(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formate un numéro de téléphone
 * @param phone - Numéro de téléphone
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '-';
  // Exemple: +221771234567 → +221 77 123 45 67
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 9) return phone;
  return phone;
}

/**
 * Formate un nombre entier avec séparateurs
 * @param num - Nombre à formater
 */
export function formatNumber(num: number): string {
  if (!Number.isFinite(num)) return '0';
  return num.toLocaleString('fr-FR');
}

/**
 * Formate la durée moyenne (pour affichage court)
 * @param seconds - Durée en secondes
 */
export function formatAverageDuration(seconds: number): string {
  return formatDuration(seconds, 'short');
}

/**
 * Formate la durée totale (pour affichage long)
 * @param seconds - Durée en secondes
 */
export function formatTotalDuration(seconds: number): string {
  return formatDuration(seconds, 'long');
}
