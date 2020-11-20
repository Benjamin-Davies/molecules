import { Atom } from './atom';
import { Bond } from './bond';
import { Canvas } from './canvas';
import { Molecule } from './molecule';

const canvas = new Canvas('main-canvas');

const molecule = new Molecule();

for (const element of ['N', 'C', 'Cl']) {
  const atom = new Atom(element, canvas.center);
  molecule.addAtom(atom);
}

try {
  molecule.autoBond();
} finally {
  molecule.log();
  molecule.draw(canvas);
}
