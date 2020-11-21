export type Vec = [number, number]

export function dist(a: Vec, b: Vec): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  return Math.sqrt(dx * dx + dy * dy);
}

export function addV(a: Vec, b: Vec): Vec {
  return [a[0] + b[0], a[1] + b[1]];
}

export function subV(a: Vec, b: Vec): Vec {
  return [a[0] - b[0], a[1] - b[1]];
}

export function scaleV(s: number, v: Vec): Vec {
  return [s * v[0], s * v[1]];
}

export function normV(v: Vec): Vec {
  return scaleV(1 / Math.sqrt(v[0] * v[0] + v[1] * v[1]), v);
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
