import { addV, dist, normV, scaleV, subV } from "./math";
import { Molecule } from "./molecule";

const bondRestingLength = 50;

// These are calculated differently
const repulsiveForce = 500;
const bondLengthForce = 0.2;

export function simulate(molecule: Molecule, dt: number) {
  for (const atom1 of molecule.atoms) {
    for (const atom2 of molecule.atoms) {
      if (atom1 === atom2) {
        continue;
      }

      const d = dist(atom1.position, atom2.position);
      const n = normV(subV(atom1.position, atom2.position));
      const vel = scaleV(repulsiveForce / (d * d), n);
      atom1.position = addV(atom1.position, vel);
    }
  }

  for (const atom1 of molecule.atoms) {
    for (const atom2 of molecule.atoms) {
      if (atom1 === atom2) {
        continue;
      }
      const bond = molecule.findBond(atom1, atom2);
      if (!bond) {
        continue;
      }

      const d = dist(atom1.position, atom2.position);
      const n = normV(subV(atom1.position, atom2.position));
      const vel = scaleV(bondLengthForce * (bondRestingLength - d), n);
      atom1.position = addV(atom1.position, vel);
    }
  }
}
