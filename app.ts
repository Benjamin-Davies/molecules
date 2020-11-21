import { Canvas } from './canvas';
import { Molecule } from './molecule';
import { simulate } from './simulate';

const canvas = new Canvas('main-canvas');

let molecule = Molecule.fromStructuralFormula('CH3C(CH2CH3)CHCHCOHO', canvas.center);

canvas.animate((dt) => {
  simulate(molecule, dt);
  molecule.center(canvas.center);
  molecule.draw(canvas);
});

for (const form of document.forms) {
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    
    const formula: HTMLInputElement = form.elements['formula'];
    const type: HTMLInputElement = form.elements['type'];

    molecule = Molecule[`from${type.value}Formula`](formula.value, canvas.center);

    console.groupCollapsed(formula.value);
    molecule.log();
    console.groupEnd();
  });
}
