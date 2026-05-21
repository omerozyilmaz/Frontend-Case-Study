export function isValidTckn(tckn: string): boolean {
  if (!/^\d{11}$/.test(tckn) || tckn[0] === "0") {
    return false;
  }
  const digits = tckn.split("").map(Number);
  const oddSum = digits[0]! + digits[2]! + digits[4]! + digits[6]! + digits[8]!;
  const evenSum = digits[1]! + digits[3]! + digits[5]! + digits[7]!;
  const tenth = (oddSum * 7 - evenSum) % 10;
  if (tenth !== digits[9]) {
    return false;
  }
  const eleventh = digits.slice(0, 10).reduce((a, b) => a + b, 0) % 10;
  return eleventh === digits[10];
}
