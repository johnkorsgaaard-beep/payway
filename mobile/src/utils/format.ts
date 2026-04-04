export function formatDKK(oere: number): string {
  const kr = oere / 100;
  return `${kr.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr.`;
}

export function formatPhone(phone: string): string {
  if (phone.startsWith('+298')) {
    const num = phone.slice(4);
    return `+298 ${num.slice(0, 3)} ${num.slice(3)}`;
  }
  return phone;
}
