import { Session } from "../models/session.model.js"
import jwt from "jsonwebtoken"

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

const saveSession = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]
        if (!token) return res.status(401).json({ message: "No token provided" })

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const { 
            duration,
            distractionSeconds,
            manualPauseCount,
            tabSwitchCount 
        } = req.body
        
        const sessionCount = await Session.countDocuments({ user: decoded.id })
        const sessionNumber = sessionCount + 1
        const flower = getFlowerForSession(sessionNumber, duration)
        const flowerResponse = flower || {
            species: null,
            rarity: null,
            message: "No flower earned for sessions under 15 minutes"
        }

        const session = await Session.create({
            user: decoded.id,
            duration,
            distractionSeconds: distractionSeconds || 0,
            manualPauseCount: manualPauseCount || 0,
            tabSwitchCount: tabSwitchCount || 0,
            flowerSpecies: flower?.species || null,
            flowerRarity: flower?.rarity || null
        })

        res.status(201).json({ message: "Session saved!", session, flower: flowerResponse })

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
        const sanitizedSessions = sessions.map((session) => {
            const sessionObj = session.toObject ? session.toObject() : session
            if (sessionObj.duration < 15) {
                sessionObj.flowerSpecies = null
                sessionObj.flowerRarity = null
            }
            return sessionObj
        })

        res.status(200).json({ sessions: sanitizedSessions })

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

export { saveSession, getSessions, getFlowerForSession }