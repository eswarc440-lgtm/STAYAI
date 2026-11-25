/**
 * Indian currency, GST calculation, and date formatting utilities.
 * Uses Indian hotel GST slabs:
 * - Up to INR 1,000/night: 0%
 * - INR 1,001 to 7,500/night: 12%
 * - Above INR 7,500/night: 18%
 */

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function getIndianHotelGstRate(nightlyBaseRate: number): number {
  if (nightlyBaseRate <= 1000) return 0;
  if (nightlyBaseRate <= 7500) return 0.12;
  return 0.18;
}

export interface PriceBreakdown {
  nightlyBase: number;
  nights: number;
  rooms: number;
  baseSubtotal: number;
  gstRate: number;
  gstAmount: number;
  platformFee: number;
  grandTotal: number;
}

export function calculatePriceBreakdown(
  nightlyBase: number,
  nights: number,
  rooms = 1
): PriceBreakdown {
  const safeNights = Math.max(1, nights);
  const safeRooms = Math.max(1, rooms);
  const baseSubtotal = nightlyBase * safeNights * safeRooms;
  const gstRate = getIndianHotelGstRate(nightlyBase);
  const gstAmount = Math.round(baseSubtotal * gstRate);
  const platformFee = 0; // Transparent zero hidden convenience fee
  const grandTotal = baseSubtotal + gstAmount + platformFee;

  return {
    nightlyBase,
    nights: safeNights,
    rooms: safeRooms,
    baseSubtotal,
    gstRate,
    gstAmount,
    platformFee,
    grandTotal,
  };
}

export function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 2;
  const diffMs = end.getTime() - start.getTime();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 1;
}

export function formatShortDate(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function formatDateTimeIST(isoTimestamp: string): string {
  const d = new Date(isoTimestamp);
  if (Number.isNaN(d.getTime())) return isoTimestamp;
  return (
    new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    }).format(d) + ' IST'
  );
}

export function getDefaultStayDates(): { checkIn: string; checkOut: string } {
  const start = new Date();
  start.setDate(start.getDate() + 14);
  const end = new Date(start);
  end.setDate(end.getDate() + 2);
  return {
    checkIn: start.toISOString().slice(0, 10),
    checkOut: end.toISOString().slice(0, 10),
  };
}
