import { Canvas } from './canvas';
import { Molecule } from './molecule';
import { simulate } from './simulate';

const canvas = new Canvas('main-canvas');

const molecule = Molecule.fromStructuralFormula('CH3C(CH2CH3)CHCHCOHO', canvas.center);

molecule.log();
canvas.animate((dt) => {
  simulate(molecule, dt);
  molecule.center(canvas.center);
  molecule.draw(canvas);
});
