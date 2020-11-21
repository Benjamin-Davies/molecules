import { Canvas } from './canvas';
import { Molecule } from './molecule';

const canvas = new Canvas('main-canvas');

const molecule = Molecule.fromSimpleStructuralFormula('CH3CHClCHCHCOHOHNH2', canvas.center);

molecule.log();
molecule.draw(canvas);
