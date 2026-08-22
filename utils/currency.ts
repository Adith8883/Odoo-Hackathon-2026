import { APP_CONFIG } from '../constants/config';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: APP_CONFIG.CURRENCY_CODE,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatAnnualCTC = (monthly: number): string => {
  return formatCurrency(monthly * 12);
};

export const parseCurrency = (str: string): number => {
  const parsed = Number(str.replace(/[^0-9.-]+/g, ''));
  return isNaN(parsed) ? 0 : parsed;
};
