export type Vec = [number, number]

export function dist(a: Vec, b: Vec): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  return Math.sqrt(dx * dx + dy * dy);
}

export function rightOf(a: Vec, b: Vec): boolean {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  return dx > 0 && dx > Math.abs(dy);
}

export function leftOf(a: Vec, b: Vec): boolean {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  return dx < 0 && -dx > Math.abs(dy);
}

export function below(a: Vec, b: Vec): boolean {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  return dy > 0 && dy > Math.abs(dx);
}

export function above(a: Vec, b: Vec): boolean {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  return dy < 0 && -dy > Math.abs(dx);
}
