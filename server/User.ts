import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            require: true,
            unique: true,
            trim: true
        },
        email: {
            type: String,
            require: true,
            unique: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        avatar: {
            type: String,
            default: "https://cdn-icons-png.flaticon.com/512/149/149071.png"
        }
    },
    {
        timestamps: true
    }
)

const User = mongoose.model("User", userSchema);
export default User;