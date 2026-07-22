export const normalizeFlowerBreed = (species) =>
  species.toLowerCase().replace(/\s+/g, "");

export const getDisplayedCount = (displayGarden, species) =>
  (displayGarden || []).filter((slot) => slot && slot.species === species).length;

export const canAddToGarden = (displayGarden, species, ownedCount) => {
  const flowerSlots = displayGarden || [];
  const displayedCount = getDisplayedCount(flowerSlots, species);

  return flowerSlots.filter(Boolean).length < 5 && displayedCount < ownedCount;
};
