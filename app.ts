import { Canvas } from './canvas';
import { Molecule } from './molecule';

const canvas = new Canvas('main-canvas');

const molecule = Molecule.fromSimpleStructuralFormula('CH3CHClCHCHCH3', canvas.center);

molecule.log();
molecule.draw(canvas);
