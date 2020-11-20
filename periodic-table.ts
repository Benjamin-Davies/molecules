export const elements = [
  'H',
  'He',
  'Li',
  'Be',
  'B',
  'C',
  'N',
  'O',
  'F',
  'Ne',
  'Na',
  'Mg',
  'Al',
  'Si',
  'P',
  'S',
  'Cl',
  'Ar',
  'K',
  'Ca',
];

export type ElementMap<T> = { [symbol: string]: T };

export const atomicNumbers: ElementMap<number> = {};
for (let i = 0; i < elements.length; i++) {
  const element = elements[i];
  atomicNumbers[element] = i + 1;;
}

export const shellCapacities = [2, 8, 8, 18, 18];

export const elementInfo: ElementMap<{
  period: number;
  electronConfiguration: number[];
  valenceElectrons: number;
  requiredBonds: number;
}> = {};
for (const element of elements) {
  const atomicNumber = atomicNumbers[element];
  const electronConfiguration: number[] = [];
  let shellCapacity: number;
  let electronsInShell: number;
  let shell: number;
  let electronsLeft: number;

  for (
    shell = 0, electronsLeft = atomicNumber;
    electronsLeft > 0;
    shell++
  ) {
    shellCapacity = shellCapacities[shell];
    if (!shellCapacity) {
      throw new Error(`Element ${element} too big`);
    }
    electronsInShell = Math.min(electronsLeft, shellCapacity);
    electronConfiguration.push(electronsInShell);
    electronsLeft -= electronsInShell;
  }
  const valenceElectrons = electronsInShell;

  const requiredBonds =
    valenceElectrons > shellCapacity / 2
      ? shellCapacity - valenceElectrons
      : valenceElectrons;

  elementInfo[element] = {
    period: shell + 1,
    electronConfiguration,
    valenceElectrons,
    requiredBonds,
  };
}
