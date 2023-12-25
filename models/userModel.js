const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");

const userModel = new mongoose.Schema({
    name: {
        type: String,
        requared: [true, "Display Name is Required"],
        minLength: [2, "Display Contain atleast 2 character"]
    },
    contact: {
        type: String,
        unique: true,
        required: [true, "Contact is requared"],
        minLength: [10, "Contact must be contain 10 charectors"],
        maxLength: [10, "Contact must not exceed 10 charectors"]
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Email is required"],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please fill a valid email address"]
    },
    password: {
        type: String,
        select: false,
        maxLength: [15, "Password should not exceed more than 15 characters"],
        minLength: [5, "Password should have atleast less than 5 characters"]
        // match[]
    },
    avatar: {
        type: Object,
        default: {
            fileId: "",
            url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZt50gh1uEkLw2lX99k9bWVzxDiKZ4O9rmqxk98XhfOg&s"
        }
    },
    resetPasswordToken: {type: String, default:"0"},
    friend: [
        { type: mongoose.Schema.Types.ObjectId, ref: "user" }
    ],
    chats: [
        { type: mongoose.Schema.Types.ObjectId, ref: "message" }
    ]

});

userModel.pre("save", function () {
    if(!this.isModified("password")) return;
    let salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt);
})

userModel.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
}

userModel.methods.getJWTToken = function () {
    return JWT.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
}

const User = mongoose.model("user", userModel);
module.exports = User;