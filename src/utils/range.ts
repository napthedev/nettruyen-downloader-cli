export const rangeAtoB = (start: number, end: number): number[] => {
  const arr: number[] = [];
  while (start <= end) {
    arr.push(start++);
  }
  return arr;
};
