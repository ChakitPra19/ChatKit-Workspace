import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            require: true,
        },
        room: {
            type: mongoose.Schema.ObjectId,
            ref: "Room",
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        }
    },
    {
        timestamps: true,
    }
)

const Message = mongoose.model("Message", messageSchema);
export default Message