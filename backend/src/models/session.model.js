import mongoose, { Schema } from "mongoose"

const sessionSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        duration: {
            type: Number,
            default: 25
        },
        flowerSpecies: {
            type: String,
            default: null
        },
        flowerRarity: {
            type: String,
            default: null
        },
        distractionSeconds: {
            type: Number,
            default: 0
        },
        manualPauseCount: {
            type: Number,
            default: 0
        },
        tabSwitchCount: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
)

export const Session = mongoose.model("Session", sessionSchema)