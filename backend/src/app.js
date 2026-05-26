// Sets up the Express app

import express from "express"
import cors from "cors"


const app = express()

app.use(express.json())
app.use(cors())
app.use(express.json())

// routes import
import userRouter from './routes/user.route.js'

// routes declaration
app.use("/api/v1/users", userRouter)

// example route: http://localhost:4000/api/v1/users/register

export default app;