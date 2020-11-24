import { ThreeDSimulation } from './3d-simulation';
import { Canvas } from './canvas';
import { Molecule } from './molecule';
import { simulate } from './simulate';

const canvas = new Canvas('main-canvas');

const twoDInput = document.getElementById('two-d') as HTMLInputElement;
const threeDInput = document.getElementById('three-d') as HTMLInputElement;
const error = document.getElementById('error');

for (const form of document.forms) {
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();

    const formula: HTMLInputElement = form.elements['formula'];
    const type: HTMLInputElement = form.elements['type'];
    error.innerText = '';

    try {
      molecule = Molecule[`from${type.value}Formula`](
        formula.value,
        canvas.center
      );

      console.groupCollapsed(formula.value);
      molecule.log();
      console.groupEnd();
    } catch (err) {
      console.error(err);
      error.innerText = err.toString();
    }
  });
}

let molecule = Molecule.fromStructuralFormula(
  'CH3C(CH2CH3)CHCHCOHO',
  canvas.center
);
let threeDSimulation: ThreeDSimulation;

canvas.animate((dt) => {
  if (twoDInput.checked) {
    simulate(molecule, dt);
    molecule.center(canvas.center);
    molecule.draw(canvas);
  } else if (threeDInput.checked) {
    if (threeDSimulation?.molecule !== molecule) {
      threeDSimulation = new ThreeDSimulation(molecule);
    }

    threeDSimulation.simulate(dt);
    threeDSimulation.draw(canvas);
  }
});
