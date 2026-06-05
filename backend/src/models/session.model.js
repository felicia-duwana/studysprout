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
            required: true
        },
        flowerRarity: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
)

export const Session = mongoose.model("Session", sessionSchema)