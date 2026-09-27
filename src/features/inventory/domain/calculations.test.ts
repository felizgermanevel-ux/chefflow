import { describe, expect, it } from "vitest";
import { inventoryDifference, inventoryValue } from "./calculations";

describe("inventory calculations", () => {
  it("calculates the inventory value", () => {
    expect(
      inventoryValue([
        { productId: "tomato", quantity: 3, unitPrice: 2.5 },
        { productId: "oil", quantity: 1, unitPrice: 8 },
      ]),
    ).toBe(15.5);
  });

  it("shows quantity and value differences from a previous inventory", () => {
    expect(
      inventoryDifference(
        [{ productId: "tomato", quantity: 5, unitPrice: 2 }],
        [{ productId: "tomato", quantity: 3, unitPrice: 2 }],
      ),
    ).toEqual([
      { productId: "tomato", quantityDifference: 2, valueDifference: 4 },
    ]);
  });
});
