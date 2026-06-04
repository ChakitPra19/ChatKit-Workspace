import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
    {
        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: true,
            unique: true,
        },
        content: {
            type: String,
            default: "",
        }
    },
    {
        timestamps: true,
    }
);

const Note = mongoose.model("Note", noteSchema);
export default Note;