import { toWords } from 'number-to-words';

export interface CurrencyInfo {
  major: string;
  minor: string;
  symbol: string;
}

export const currencyWordsMap: Record<string, CurrencyInfo> = {
  INR: { major: 'Rupees', minor: 'Paise', symbol: '₹' },
  USD: { major: 'Dollars', minor: 'Cents', symbol: '$' },
  GBP: { major: 'Pounds', minor: 'Pence', symbol: '£' },
  AED: { major: 'Dirhams', minor: 'Fils', symbol: 'AED' },
};

export function getCurrencyInfo(currency: string): CurrencyInfo {
  return currencyWordsMap[currency] || { major: 'Units', minor: 'Fraction', symbol: currency };
}

export function formatCurrency(amount: number, currency: string, locale?: string): string {
  return new Intl.NumberFormat(locale || 'en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function amountToWords(amount: number, currency: string): string {
  const cw = getCurrencyInfo(currency);
  if (amount <= 0) return `Zero ${cw.major} Only`;

  const integerPart = Math.floor(amount);
  const fractionalPart = Math.round((amount - integerPart) * 100);

  let words = toWords(integerPart).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) + ` ${cw.major}`;

  if (fractionalPart > 0) {
    words += ' and ' + toWords(fractionalPart).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) + ` ${cw.minor}`;
  }

  return words + ' Only';
}
