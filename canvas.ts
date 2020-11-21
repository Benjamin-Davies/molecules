export class Canvas {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  constructor(id: string) {
    this.canvas = document.getElementById(id) as HTMLCanvasElement;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.ctx = this.canvas.getContext('2d');
  }

  get center(): [number, number] {
    return [this.canvas.width / 2, this.canvas.height / 2];
  }

  animate(callback: (dt: number, cancel: () => void) => void) {
    let lastFrame = performance.now();
    const fn = () => {
      const now = performance.now();
      const dt = (now - lastFrame) / 1000;
      lastFrame = now;
      let cancelled = false;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      callback(dt, () => (cancelled = true));

      if (!cancelled) {
        requestAnimationFrame(fn);
      }
    };

    requestAnimationFrame(fn);
  }

  drawCircle(position: [number, number], radius: number) {
    this.ctx.fillStyle = 'white';
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(...position, radius, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();
  }

  drawText(position: [number, number], text: string) {
    this.ctx.fillStyle = 'black';
    this.ctx.font = '20px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, ...position);
  }

  drawLine(a: [number, number], b: [number, number]) {
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(...a);
    this.ctx.lineTo(...b);
    this.ctx.stroke();
  }

  drawParallelLines(a: [number, number], b: [number, number], n: number = 2) {
    this.ctx.beginPath();
    this.ctx.moveTo(...a);
    this.ctx.lineTo(...b);

    for (let w = 3 * (2 * n - 1), black = true; w > 0; w -= 6, black = !black) {
      this.ctx.strokeStyle = black ? 'black' : 'white';
      this.ctx.lineWidth = w;
      this.ctx.stroke();
    }
  }
}
