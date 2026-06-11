export function toMoney(value: number): string {
  return value.toFixed(2);
}

export function lineAmount(qty: number, unitPrice: number): number {
  return Number((qty * unitPrice).toFixed(2));
}

export function calcTax(subtotal: number, taxRate: number): number {
  return Number(((subtotal * taxRate) / 100).toFixed(2));
}
