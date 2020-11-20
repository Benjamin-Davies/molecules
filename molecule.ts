import { Atom } from "./atom";
import { Bond } from "./bond";
import { Canvas } from "./canvas";
import { above, below, dist, leftOf, rightOf } from "./math";

const bondLength = 100;
const minBondLength = 70;

export class Molecule {
  private atoms: Atom[] = [];
  private bonds: Bond[] = [];
  private bondMap = new Map<Atom, Bond[]>();

  log() {
    console.group('ATOMS:');
    console.table(this.atoms);
    console.groupEnd();

    console.group('BONDS:');
    console.table(this.bonds);
    console.groupEnd();
  }

  draw(canvas: Canvas) {
    for (const bond of this.bonds) {
      bond.draw(canvas);
    }
    for (const atom of this.atoms) {
      atom.draw(canvas);
    }
  }

  addAtom(atom: Atom) {
    this.atoms.push(atom);
    this.bondMap.set(atom, []);
  }

  bond(atom1: Atom, atom2: Atom, count: number = 1) {
    const existingBond = this.findBond(atom1, atom2);
    if (existingBond) {
      existingBond.count += count;
      return;
    }

    if (dist(atom1.position, atom2.position) < minBondLength) {
      atom2.position = this.getNextBondingPosition(atom1);
    }

    const bond = new Bond(atom1, atom2, count);
    this.bonds.push(bond);

    this.bondMap.get(atom1).push(bond);
    this.bondMap.get(atom2).push(bond);
  }

  findBond(atom1: Atom, atom2: Atom) {
    const bondList = this.bondMap.get(atom1);
    return bondList.find(
      (bond) => bond.atom1 === atom2 || bond.atom2 === atom2
    );
  }

  getNextBondingPosition(atom: Atom): [number, number] {
    const bonds = this.bondMap.get(atom);
    const bondedTo: Atom[] = [];
    for (const bond of bonds) {
      if (bond.atom1 !== atom) {
        bondedTo.push(bond.atom1);
      }
      if (bond.atom2 !== atom) {
        bondedTo.push(bond.atom2);
      }
    }

    const [x, y] = atom.position;
    if (!bondedTo.some((a) => rightOf(atom.position, a.position)))
      return [x + bondLength, y];
    if (!bondedTo.some((a) => leftOf(atom.position, a.position)))
      return [x - bondLength, y];
    if (!bondedTo.some((a) => below(atom.position, a.position)))
      return [x, y + bondLength];
    if (!bondedTo.some((a) => above(atom.position, a.position)))
      return [x, y - bondLength];
    throw new Error('Trying to over-bond atom');
  }

  autoBond() {
    // DESC atomic number
    this.atoms.sort((a, b) => b.atomicNumber - a.atomicNumber);
    // DESC required bonds
    this.atoms.sort((a, b) => b.requiredBonds - a.requiredBonds);

    const centerAtom = this.atoms[0];
    const otherAtoms = this.atoms.slice(1);
    for (const atom of otherAtoms) {
      this.bond(centerAtom, atom);
    }

    console.log(this.bondMap.get(centerAtom));
    console.log(centerAtom.requiredBonds);
    console.log(this.hasRequiredBonds);
    for (let i = 0; !this.hasRequiredBonds; i++) {
      if (i > 100) {
        throw new Error('Auto bonding taking too long');
      }

      for (const atom of otherAtoms) {
        if (atom.requiredBonds > this.totalBonds(atom)) {
          this.bond(centerAtom, atom);
        }
      }
    }
  }

  get hasRequiredBonds() {
    for (const atom of this.atoms) {
      const totalBonds = this.totalBonds(atom);
      if (totalBonds !== atom.requiredBonds) {
        if (totalBonds > atom.requiredBonds) {
          console.warn(`${atom.symbol} atom is over-bonded`);
        }
        return false;
      }
    }
    return true;
  }

  private totalBonds(atom: Atom) {
    const bondList = this.bondMap.get(atom);
    const totalBonds = bondList.reduce((acc, bond) => acc + bond.count, 0);
    return totalBonds;
  }
}
