import { Session } from "../models/session.model.js"
import jwt from "jsonwebtoken"
import { getFlowerForSession, resolveSessionFlower } from "../utils/flower.js"

const getSelectedFlower = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]
        if (!token) return res.status(401).json({ message: "No token provided" })

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const duration = Number(req.query.duration || 0)
        const sessionCount = await Session.countDocuments({ user: decoded.id })
        const sessionNumber = sessionCount + 1
        const flower = getFlowerForSession(sessionNumber, duration)

        res.status(200).json({ flower: flower || null, sessionNumber })
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
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
            tabSwitchCount,
            flowerSpecies,
            flowerRarity
        } = req.body
        
        const sessionCount = await Session.countDocuments({ user: decoded.id })
        const sessionNumber = sessionCount + 1
        const flower = resolveSessionFlower({
            duration,
            flowerSpecies,
            flowerRarity,
            sessionNumber
        })

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

export { saveSession, getSessions, getSelectedFlower, getFlowerForSession }