import { Atom } from './atom';
import { Bond } from './bond';
import { Canvas } from './canvas';
import { Molecule } from './molecule';

const canvas = new Canvas('main-canvas');

const molecule = Molecule.fromMolecularFormula('SO2', canvas.center);

try {
  molecule.autoBond();
} finally {
  molecule.log();
  molecule.draw(canvas);
}
