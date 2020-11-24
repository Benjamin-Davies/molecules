import { Molecule } from './molecule';
import * as THREE from 'three';
import { Canvas } from './canvas';
import { AmbientLight, DirectionalLight } from 'three';
import { Atom } from './atom';

export class ThreeDSimulation {
  canvas: HTMLCanvasElement;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  sphereGeometry: THREE.BufferGeometry;
  material: THREE.MeshPhongMaterial;

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
      this.scene.add(sphere);
    }
  }

  simulate(dt: number) {}

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
    this.position.set(atom.position[0], -atom.position[1], 0);
    this.scale.setScalar(atom.elementInfo.electronConfiguration.length + 1);
  }
}
