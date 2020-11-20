import { Atom } from "./atom";
import { Canvas } from "./canvas";

export class Bond {
  constructor(
    public atom1: Atom,
    public atom2: Atom,
    /**
     * The number of shared electrons
     * eg. 2 for a double bond
     */
    public count: number
  ) {}

  draw(canvas: Canvas) {
    canvas.drawParallelLines(this.atom1.position, this.atom2.position, this.count);
  }
}
