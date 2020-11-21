import { Canvas } from './canvas';
import { Molecule } from './molecule';

const canvas = new Canvas('main-canvas');

const molecule = Molecule.fromSimpleStructuralFormula('CH3CH2CH3', canvas.center);

molecule.log();
molecule.draw(canvas);
