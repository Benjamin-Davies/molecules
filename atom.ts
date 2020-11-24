import { Canvas } from "./canvas";
import { atomicNumbers, elementInfo } from "./periodic-table";

export class Atom {
  constructor(public symbol: string, public position: [number, number]) {}

  draw(canvas: Canvas) {
    canvas.drawCircle(this.position, 20)
    canvas.drawText(this.position, this.symbol);
  }

  get atomicNumber() {
    return atomicNumbers[this.symbol];
  }
  get elementInfo() {
    return elementInfo[this.symbol];
  }
  get requiredBonds() {
    return elementInfo[this.symbol].requiredBonds;
  }
}
