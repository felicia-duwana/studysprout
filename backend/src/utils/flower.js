const getFlowerForSession = (sessionNumber, duration) => {
  if (duration < 15) {
    return null
  }

  const rand = Math.random() * 100
  const isType3 = sessionNumber >= 21 || duration > 100
  const isType2 = (sessionNumber >= 11 && sessionNumber <= 20) || duration >= 30
  const isType1 = (sessionNumber >= 1 && sessionNumber <= 10) || duration >= 15

  if (isType3) {
    if (rand < 60) return { species: "Orchid", rarity: "Rare" }
    if (rand < 95) return { species: "Blue Rose", rarity: "Legendary" }
    return { species: "Sakura", rarity: "Mythical" }
  }

  if (isType2) {
    if (rand < 60) return { species: "Rose", rarity: "Uncommon" }
    if (rand < 90) return { species: "Lavender", rarity: "Rare" }
    return { species: "Lily", rarity: "Legendary" }
  }

  if (isType1) {
    if (rand < 60) return { species: "Sunflower", rarity: "Common" }
    if (rand < 90) return { species: "Daisy", rarity: "Uncommon" }
    return { species: "Tulip", rarity: "Rare" }
  }

  return null
}

const resolveSessionFlower = ({ duration, flowerSpecies, flowerRarity, sessionNumber }) => {
  if (duration < 15) {
    return null
  }

  if (flowerSpecies) {
    return {
      species: flowerSpecies,
      rarity: flowerRarity || getFlowerRarityBySpecies(flowerSpecies)
    }
  }

  return getFlowerForSession(sessionNumber, duration)
}

const getFlowerRarityBySpecies = (species) => {
  switch (species?.toLowerCase()) {
    case "sunflower":
      return "Common"
    case "daisy":
      return "Uncommon"
    case "rose":
      return "Uncommon"
    case "tulip":
      return "Rare"
    case "lavender":
      return "Rare"
    case "orchid":
      return "Rare"
    case "lily":
      return "Legendary"
    case "blue rose":
    case "bluerose":
      return "Legendary"
    case "sakura":
      return "Mythical"
    default:
      return null
  }
}

export { getFlowerForSession, getFlowerRarityBySpecies, resolveSessionFlower }
