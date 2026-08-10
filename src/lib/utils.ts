import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatearHora12 = (hora24: string | undefined): string => {
  if (!hora24) return '';
  try {
    const partes = hora24.split(':');
    if (partes.length < 2) return hora24;
    let horas = parseInt(partes[0], 10);
    const minutos = partes[1];
    if (isNaN(horas)) return hora24;
    const ampm = horas >= 12 ? 'PM' : 'AM';
    horas = horas % 12;
    horas = horas ? horas : 12; // el número '0' debe ser '12'
    return `${horas}:${minutos} ${ampm}`;
  } catch {
    return hora24;
  }
};

export const formatearRangoHora12 = (rango: string | undefined): string => {
  if (!rango) return '';
  if (!rango.includes('-')) return formatearHora12(rango);
  return rango.split('-').map(h => formatearHora12(h.trim())).join(' - ');
};
