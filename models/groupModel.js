const mongoose = require("mongoose");

const groupModel = new mongoose.Schema({
    name: {type: String, required: [true, "Group name is Required"]},
    avatar: {
        type: Object,
        default: {
            fileId: "",
            url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZt50gh1uEkLw2lX99k9bWVzxDiKZ4O9rmqxk98XhfOg&s"
        }
    },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    members: [{ type: String, unique: true}],
    chats: [
        { type: mongoose.Schema.Types.ObjectId, ref: "message" }
    ],
    isGroup: { type: Boolean, default: true }

}, { timestamps: true });


const Group = mongoose.model("group", groupModel);
module.exports = Group;