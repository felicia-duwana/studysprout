import { Session } from "../models/session.model.js"
import jwt from "jsonwebtoken"

const saveSession = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]
        if (!token) return res.status(401).json({ message: "No token provided" })

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const session = await Session.create({
            user: decoded.id,
            duration: 25
        })

        res.status(201).json({ message: "Session saved!", session })

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

export { saveSession, getSessions }