import { getFlowerForSession, resolveSessionFlower } from './flower.js'

describe("getFlowerForSession", () => {
    it("returns a sunflower for early sessions when random is low", () => {
        const originalRandom = Math.random
        Math.random = () => 0.2
        try {
            const flower = getFlowerForSession(1, 15)
            expect(flower).toEqual({ species: "Sunflower", rarity: "Common" })
        } finally {
            Math.random = originalRandom
        }
    })

    it("returns lavender for the middle session range when random is moderate", () => {
        const originalRandom = Math.random
        Math.random = () => 0.7
        try {
            const flower = getFlowerForSession(12, 30)
            expect(flower).toEqual({ species: "Lavender", rarity: "Rare" })
        } finally {
            Math.random = originalRandom
        }
    })

    it("returns sakura for long sessions when random is high", () => {
        const originalRandom = Math.random
        Math.random = () => 0.99
        try {
            const flower = getFlowerForSession(25, 120)
            expect(flower).toEqual({ species: "Sakura", rarity: "Mythical" })
        } finally {
            Math.random = originalRandom
        }
    })
})

describe("resolveSessionFlower", () => {
    it("uses the provided flower when saving a session with a flower already selected", () => {
        const flower = resolveSessionFlower({
            duration: 25,
            flowerSpecies: "Rose",
            flowerRarity: "Uncommon",
            sessionNumber: 3
        })
        expect(flower).toEqual({ species: "Rose", rarity: "Uncommon" })
    })

    it("falls back to a mapped rarity when a flower is provided without rarity", () => {
        const flower = resolveSessionFlower({
            duration: 25,
            flowerSpecies: "Sunflower",
            sessionNumber: 3
        })
        expect(flower).toEqual({ species: "Sunflower", rarity: "Common" })
    })

    it("returns null for sessions shorter than 15 minutes even if a flower was provided", () => {
        const flower = resolveSessionFlower({
            duration: 10,
            flowerSpecies: "Rose",
            flowerRarity: "Uncommon",
            sessionNumber: 3
        })
        expect(flower).toBeNull()
    })
})