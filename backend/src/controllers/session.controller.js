import { Session } from "../models/session.model.js"
import jwt from "jsonwebtoken"

const getFlowerForSession = (sessionCount) => {
    const rand = Math.random() * 100

    if (sessionCount <= 10) {
        if (rand < 60) return { species: "Sunflower", rarity: "Common" }
        if (rand < 90) return { species: "Daisy", rarity: "Uncommon" }
        return { species: "Tulip", rarity: "Rare" }
    } else if (sessionCount <= 20) {
        if (rand < 60) return { species: "Rose", rarity: "Uncommon" }
        if (rand < 90) return { species: "Lavender", rarity: "Rare" }
        return { species: "Lily", rarity: "Legendary" }
    } else {
        if (rand < 60) return { species: "Orchid", rarity: "Rare" }
        if (rand < 95) return { species: "Blue Rose", rarity: "Legendary" }
        return { species: "Sakura", rarity: "Mythical" }
    }
}

const saveSession = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]
        if (!token) return res.status(401).json({ message: "No token provided" })

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const sessionCount = await Session.countDocuments({ user: decoded.id })
        const flower = getFlowerForSession(sessionCount)

        const session = await Session.create({
            user: decoded.id,
            duration: 25,
            flowerSpecies: flower.species,
            flowerRarity: flower.rarity
        })

        res.status(201).json({ message: "Session saved!", session, flower })

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

const getSessions = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]
        if (!token) return res.status(401).json({ message: "No token provided" })

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const sessions = await Session.find({ user: decoded.id }).sort({ createdAt: -1 })

        res.status(200).json({ sessions })

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

export { saveSession, getSessions, getFlowerForSession }