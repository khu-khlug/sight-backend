export function isDifferentStringArray(a: string[], b: string[]): boolean {
  if (a.length !== b.length) {
    return true;
  }

  const copiedA = [...a];
  copiedA.sort();

  const copiedB = [...b];
  copiedB.sort();

  for (let i = 0; i < copiedA.length; i++) {
    if (copiedA[i] !== copiedB[i]) {
      return true;
    }
  }

  return false;
}
