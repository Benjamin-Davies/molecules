import { Atom } from "./atom";
import { Bond } from "./bond";
import { Canvas } from "./canvas";
import { above, below, dist, leftOf, rightOf } from "./math";

const hydrogenBondLength = 50;
const normalBondLength = 100;

type FormulaParts = (string | FormulaParts)[];

export class Molecule {
  atoms: Atom[] = [];
  private bonds: Bond[] = [];
  private bondMap = new Map<Atom, Bond[]>();

  static fromMolecularFormula(formula: string, center: [number, number]) {
    const atoms = Molecule.parseFormula(formula);

    const molecule = new Molecule();
    for (const symbol of atoms) {
      molecule.addAtom(new Atom(symbol, center));
    }

    molecule.autoBond();

    return molecule;
  }

  static fromSimpleStructuralFormula(
    formula: string,
    center: [number, number]
  ) {
    const atoms = Molecule.parseFormula(formula).map(
      (symbol) => new Atom(symbol, center)
    );

    const molecule = new Molecule();
    const deferedBonds: [Atom, Atom][] = [];
    let lastAtom: Atom;
    for (const atom of atoms) {
      molecule.addAtom(atom);

      if (lastAtom?.requiredBonds > atom?.requiredBonds) {
        deferedBonds.push([lastAtom, atom]);
        continue;
      }

      if (lastAtom) {
        molecule.bond(lastAtom, atom);
      }
      lastAtom = atom;
    }
    lastAtom = null;
    for (const [a, b] of deferedBonds) {
      if (lastAtom && molecule.totalBonds(lastAtom) < lastAtom.requiredBonds) {
        molecule.bond(lastAtom, b);
      } else {
        molecule.bond(a, b);
        lastAtom = b;
      }
    }

    molecule.addExtraBonds();

    return molecule;
  }

  static fromStructuralFormula(formula: string, center: [number, number]) {
    const parts = this.parseFormulaParts(formula);
    return this.fromStructuralFormulaParts(parts, center);
  }

  private static fromStructuralFormulaParts(
    parts: string | FormulaParts,
    center: [number, number]
  ): Molecule {
    if (typeof parts === 'string') {
      return this.fromSimpleStructuralFormula(parts, center);
    } else {
      return parts
        .map((part) =>
          this.fromStructuralFormulaParts(part, [
            center[0] * Math.random(),
            center[1] * Math.random(),
          ])
        )
        .reduce((a, b) => a.join(b));
    }
  }

  join(other: Molecule): Molecule {
    const atom1 = this.freeAtom;
    const atom2 = other.freeAtom;
    this.merge(other);
    this.bond(atom1, atom2);
    return this;
  }

  get freeAtom() {
    for (const atom of this.atoms) {
      if (this.totalBonds(atom) < atom.requiredBonds) {
        return atom;
      }
    }
  }

  merge(other: Molecule): Molecule {
    this.atoms = this.atoms.concat(other.atoms);
    this.bonds = this.bonds.concat(other.bonds);

    for (const atom of other.atoms) {
      this.bondMap.set(atom, []);
    }
    for (const bond of other.bonds) {
      this.bondMap.get(bond.atom1).push(bond);
      this.bondMap.get(bond.atom2).push(bond);
    }

    return this;
  }

  private static parseFormulaParts(formula: string) {
    interface State {
      parts: FormulaParts;
      currentPart: string;
    }

    let state: State = {
      parts: [],
      currentPart: '',
    };
    const stack: State[] = [];
    for (let i = 0; i < formula.length; ) {
      const c = formula[i++];
      switch (c) {
        case '(':
          state.parts.push(state.currentPart);
          state.currentPart = '';

          stack.push(state);
          state = {
            parts: [],
            currentPart: '',
          };
          break;
        case ')':
          state.parts.push(state.currentPart);

          const oldState = state;
          state = stack.pop();
          state.parts.push(oldState.parts);
          break;
        default:
          state.currentPart += c;
          break;
      }
    }

    if (stack.length > 0) {
      throw new Error('');
    }
    state.parts.push(state.currentPart);
    return state.parts;
  }

  private static parseFormula(formula: string) {
    const atoms: string[] = [];
    for (let i = 0; i < formula.length; ) {
      let symbol = formula[i++];
      let countStr = '';
      while (i < formula.length && isLower(formula[i])) {
        symbol += formula[i++];
      }
      while (i < formula.length && isNumeric(formula[i])) {
        countStr += formula[i++];
      }

      const count = +countStr || 1;
      for (let j = 0; j < count; j++) {
        atoms.push(symbol);
      }
    }
    return atoms;
  }

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

    const bondLength =
      atom1.symbol === 'H' || atom2.symbol === 'H'
        ? hydrogenBondLength
        : normalBondLength;
    atom2.position = this.getNextBondingPosition(atom1, bondLength);

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

  getNextBondingPosition(atom: Atom, bondLength: number): [number, number] {
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

    this.addExtraBonds();

    // For edge cases like SO2
    for (let i = 0; !this.hasRequiredBonds; i++) {
      if (i > 100) {
        throw new Error('Auto bonding taking too long');
      }

      for (const atom of otherAtoms) {
        if (atom.requiredBonds > this.totalBonds(atom)) {
          this.bond(centerAtom, atom);
          break;
        }
      }
    }
  }

  get hasRequiredBonds() {
    let extraBondsNeeded = 0;
    for (const atom of this.atoms) {
      const totalBonds = this.totalBonds(atom);
      if (totalBonds !== atom.requiredBonds) {
        if (totalBonds > atom.requiredBonds) {
          console.warn(`${atom.symbol} atom is over-bonded`);
        }
        extraBondsNeeded += atom.requiredBonds - totalBonds;
      }
    }
    return extraBondsNeeded === 0;
  }

  addExtraBonds() {
    for (let i = 0; !this.hasRequiredBonds; i++) {
      if (i > 10) {
        console.warn('Auto bonding taking too long, skipping');
        return;
      }

      for (const bond of this.bonds) {
        if (
          this.totalBonds(bond.atom1) < bond.atom1.requiredBonds &&
          this.totalBonds(bond.atom2) < bond.atom2.requiredBonds
        ) {
          this.bond(bond.atom1, bond.atom2);
          break;
        }
      }
    }
  }

  private totalBonds(atom: Atom) {
    const bondList = this.bondMap.get(atom);
    const totalBonds = bondList.reduce((acc, bond) => acc + bond.count, 0);
    return totalBonds;
  }

  center(center?: [number, number]): [number, number] {
    const cx =
      this.atoms.reduce((acc, atom) => acc + atom.position[0], 0) /
      this.atoms.length;
    const cy =
      this.atoms.reduce((acc, atom) => acc + atom.position[1], 0) /
      this.atoms.length;
    if (!center) {
      return [cx, cy];
    }

    const dx = center[0] - cx;
    const dy = center[1] - cy;
    for (const atom of this.atoms) {
      atom.position[0] += dx;
      atom.position[1] += dy;
    }
    return center;
  }
}

function isLower(c: string) {
  return c === c.toLowerCase() && c !== c.toUpperCase();
}

function isNumeric(c: string) {
  return '1234567890'.includes(c);
}
