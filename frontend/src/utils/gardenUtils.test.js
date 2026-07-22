import { canAddToGarden, getDisplayedCount } from "./gardenUtils";

describe("garden utility rules", () => {
  it("counts how many copies of a species are already displayed", () => {
    const displayGarden = [
      { id: "garden-1", species: "Sunflower" },
      { id: "garden-2", species: "Sunflower" },
      { id: "garden-3", species: "Rose" },
    ];

    expect(getDisplayedCount(displayGarden, "Sunflower")).toBe(2);
    expect(getDisplayedCount(displayGarden, "Rose")).toBe(1);
  });

  it("blocks adding a flower when the display limit or owned limit is reached", () => {
    const fullGarden = Array.from({ length: 5 }, () => ({ id: "slot", species: "Sunflower" }));
    const ownedGarden = [
      { id: "garden-1", species: "Sunflower" },
      { id: "garden-2", species: "Sunflower" },
      { id: "garden-3", species: "Sunflower" },
    ];

    expect(canAddToGarden(fullGarden, "Sunflower", 3)).toBe(false);
    expect(canAddToGarden(ownedGarden, "Sunflower", 3)).toBe(false);
    expect(canAddToGarden(ownedGarden, "Rose", 2)).toBe(true);
  });
});
