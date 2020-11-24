import { Molecule } from './molecule';
import * as THREE from 'three';
import { Canvas } from './canvas';
import { AmbientLight, DirectionalLight, Vector3 } from 'three';
import { Atom } from './atom';

const bondRestingLength = 50;
const hydrogenBondRestingLength = 30;

// These are calculated differently
const repulsiveForce = 500;
const bondLengthForce = 0.2;

export class ThreeDSimulation {
  canvas: HTMLCanvasElement;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  sphereGeometry: THREE.BufferGeometry;
  material: THREE.MeshPhongMaterial;

  atoms: SimulatedAtom[] = [];

  constructor(public molecule: Molecule) {
    this.canvas = document.createElement('canvas');
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x333333);

    this.camera = new THREE.PerspectiveCamera();
    this.camera.position.set(0, 0, 700);
    const ambient = new AmbientLight(0xffffff, 0.8);
    const directional = new DirectionalLight(0xffffff, 1);
    directional.position.set(3, 7, 5);
    this.scene.add(this.camera, ambient, directional);

    molecule.center([0, 0]);
    for (const atom of molecule.atoms) {
      const sphere = new SimulatedAtom(atom);
      this.atoms.push(sphere);
      this.scene.add(sphere);
    }
  }

  simulate(dt: number) {
    for (const atom1 of this.atoms) {
      for (const atom2 of this.atoms) {
        if (atom1 === atom2) {
          continue;
        }

        const d = atom1.position.distanceTo(atom2.position);
        const n = atom1.position.clone().sub(atom2.position).normalize();
        const vel = n.multiplyScalar(repulsiveForce / (d * d));
        atom1.position.add(vel);
      }
    }

    for (const atom1 of this.atoms) {
      for (const atom2 of this.atoms) {
        if (atom1 === atom2) {
          continue;
        }
        const bond = this.molecule.findBond(atom1.atom, atom2.atom);
        if (!bond) {
          continue;
        }

        const len =
          atom1.atom.symbol === 'H' || atom2.atom.symbol === 'H'
            ? hydrogenBondRestingLength
            : bondRestingLength;
        const d = atom1.position.distanceTo(atom2.position);
        const n = atom1.position.clone().sub(atom2.position).normalize();
        const vel = n.multiplyScalar(bondLengthForce * (len - d));
        atom1.position.add(vel);
      }
    }

    const center = this.atoms
      .reduce((acc, a) => acc.add(a.position), new Vector3())
      .divideScalar(this.atoms.length);
    for (const atom of this.atoms) {
      atom.position.sub(center);
    }
  }

  draw(canvas: Canvas) {
    const w = this.canvas.width = canvas.canvas.width;
    const h = this.canvas.height = canvas.canvas.height;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    this.renderer.render(this.scene, this.camera);

    canvas.drawImage([0, 0], this.canvas);
  }
}

const sphereGeometry = new THREE.SphereBufferGeometry(5);

function getColor(atom: Atom): number {
  switch (atom.symbol) {
    case 'H':
      return 0xffffff;
    case 'C':
      return 0x000000;
    case 'O':
      return 0xff0000;
    case 'N':
      return 0xaaaaff;
  }
  if (atom.requiredBonds === 0) return 0xaaaaff;
  if (atom.requiredBonds === 1) return 0x00ff00;
  return 0xaaaaaa;
}

export class SimulatedAtom extends THREE.Mesh {
  atom: Atom;

  constructor(atom: Atom) {
    const material = new THREE.MeshPhongMaterial({ color: getColor(atom) });

    super(sphereGeometry, material);
    this.atom = atom;
    // Randomize the Z component so that it can leave the plane later
    this.position.set(atom.position[0], -atom.position[1], Math.random());
    this.scale.setScalar(atom.elementInfo.electronConfiguration.length + 1);
  }
}
