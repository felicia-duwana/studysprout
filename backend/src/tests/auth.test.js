import dotenv from "dotenv"
dotenv.config({ path: "./.env" })
import request from "supertest"
import mongoose from "mongoose"
import app from "../app.js"
import connectDB from "../config/database.js"

beforeAll(async () => {
    await connectDB()
    await mongoose.connection.collection("users").deleteOne({ email: "testuser@test.com" })
}, 30000)

afterAll(async () => {
    await mongoose.connection.collection("users").deleteOne({ email: "testuser@test.com" })
    await mongoose.connection.close()
})

describe("Auth API", () => {
    describe("POST /api/v1/users/register", () => {
        it("should register a new user successfully", async () => {
            const res = await request(app)
                .post("/api/v1/users/register")
                .send({ username: "testuser", email: "testuser@test.com", password: "password123" })
            expect(res.status).toBe(201)
            expect(res.body.message).toBe("User registered successfully!")
        }, 15000)

        it("should reject registration with missing fields", async () => {
            const res = await request(app)
                .post("/api/v1/users/register")
                .send({ email: "test@test.com" })
            expect(res.status).toBe(400)
        }, 15000)

        it("should reject registration with password under 8 characters", async () => {
            const res = await request(app)
                .post("/api/v1/users/register")
                .send({ username: "testuser2", email: "test2@test.com", password: "123" })
            expect(res.status).toBe(400)
        }, 15000)
    })

    describe("POST /api/v1/users/login", () => {
        it("should login successfully with correct credentials", async () => {
            const res = await request(app)
                .post("/api/v1/users/login")
                .send({ email: "testuser@test.com", password: "password123" })
            expect(res.status).toBe(200)
            expect(res.body.token).toBeDefined()
        }, 15000)

        it("should reject login with wrong password", async () => {
            const res = await request(app)
                .post("/api/v1/users/login")
                .send({ email: "testuser@test.com", password: "wrongpassword" })
            expect(res.status).toBe(400)
            expect(res.body.message).toBe("Invalid credentials")
        }, 15000)

        it("should reject login with non-existent email", async () => {
            const res = await request(app)
                .post("/api/v1/users/login")
                .send({ email: "nobody@test.com", password: "password123" })
            expect(res.status).toBe(400)
            expect(res.body.message).toBe("User not found")
        }, 15000)
    })
})