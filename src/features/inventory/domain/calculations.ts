export type InventoryLine = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

export function inventoryValue(lines: InventoryLine[]): number {
  return lines.reduce(
    (total, line) => total + line.quantity * line.unitPrice,
    0,
  );
}

export function inventoryDifference(
  current: InventoryLine[],
  previous: InventoryLine[],
) {
  const previousByProduct = new Map(
    previous.map((line) => [line.productId, line]),
  );
  return current.map((line) => {
    const previousLine = previousByProduct.get(line.productId);
    const quantityDifference = line.quantity - (previousLine?.quantity ?? 0);
    const valueDifference =
      line.quantity * line.unitPrice -
      (previousLine ? previousLine.quantity * previousLine.unitPrice : 0);
    return { productId: line.productId, quantityDifference, valueDifference };
  });
}
