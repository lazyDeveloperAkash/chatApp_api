const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");

const messageModel = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    receaver: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    msg: { type: String },
    iv: { type: String }

}, { timestamps: true });


const Message = mongoose.model("message", messageModel);
module.exports = Message;