import { User } from "../models/user.model.js"
import jwt from "jsonwebtoken"

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body

        // basic validation
        
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are important!" })
        }

        // check if user exists already

        const existing = await User.findOne({ email: email.toLowerCase() })
        if (existing) {
            return res.status(400).json({ message: "User already exists!"} )
        }

        // create user

        const user = await User.create({
            username,
            email: email.toLowerCase(),
            password: password,
            loggedIn: false
        })

        res.status(201).json({ 
            message: "User registered successfully!",
            user: { id: user._id, email: user.email, username: user.username }
        })
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message })
    }
}

const loginUser = async (req, res) => {
    try {

        // Checking if the user already exists
        const { email, password } = req.body

        const user = await User.findOne({
            email: email.toLowerCase()
        })

        if(!user) return res.status(400).json({
            message: "User not found"
        })

        // Compare passwords
        const isMatch = await user.comparePassword(password)
        if(!isMatch) return res.status(400).json({
            message: "Invalid credentials"
        })

        // JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )

        res.status(200).json({
            message: "User logged in",
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username
            }
        })

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

const logoutUser = async (req, res) => {
    try {
        const { email } = req.body
        const user = await User.findOne({
            email
        })

        if(!user) return res.status(404).json({
            message: "User not found"
        })

        res.status(200).json({
            message: "Logout successful"
        })

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error", error
        })
    }
}

export {
    registerUser,
    loginUser,
    logoutUser
}