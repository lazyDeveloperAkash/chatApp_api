const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors");
const User = require("../models/userModel");
const Message = require("../models/message")
const ErrorHandler = require("../utils/errorHandler");
const { sendToken } = require("../utils/sendToken");
const { sendmail } = require("../utils/nodemailer")
const imagekit = require("../utils/imageKit").initImageKit();
const path = require("path");
const crypto = require("crypto");

const algorithm = 'aes-256-cbc'
const key = process.env.KEY;
const iv = crypto.randomBytes(16);


exports.homePage = (req, res, next) => {
    res.json({ msg: "hey" })
}

exports.currentUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.id).populate('friend').exec();
    res.json(user);
})

exports.userSingup = catchAsyncErrors(async (req, res, next) => {
    const user = await new User(req.body).save();
    sendToken(user, 201, res);
});

exports.userSinginEmail = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email }).select("+password").exec();
    if (!user) { return next(new ErrorHandler("User not Found with This Email Address", 404)) };
    const isMatch = user.comparePassword(req.body.password);
    if (!isMatch) return next(new ErrorHandler("Wrong password", 500));
    sendToken(user, 200, res);
});

exports.userSinginContact = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ contact: req.body.contact }).select("+password").exec();
    if (!user) { return next(new ErrorHandler("User not Found with This Number", 404)) };
    const isMatch = user.comparePassword(req.body.password);
    if (!isMatch) return next(new ErrorHandler("Wrong password", 500));
    sendToken(user, 200, res);
});

exports.userSingout = catchAsyncErrors(async (req, res, next) => {
    res.clearCookie("token");
    res.json({ message: "succesfully singout!" })
});

exports.userAvatar = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.id).exec();
    const file = req.files.avatar;
    const modifiedFielName = `chatApp-profilePicture${Date.now()}${path.extname(file.name)}`;
    if (user.avatar.fileId !== "") {
        await imagekit.deleteFile(user.avatar.fileId);
    }
    const { fileId, url } = await imagekit.upload({
        file: file.data,
        fileName: modifiedFielName
    })
    user.avatar = { fileId, url };
    await user.save();
    res.status(200).json({
        success: true,
        message: "Profile Image Updated !"
    })
});

exports.sendMail = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email }).exec();
    if (!user) {
        return next(new ErrorHandler("User not found with this email address", 404));
    }

    const otp = Math.floor(Math.random() * 9000 * 1000);
    sendmail(req, res, next, otp);
    user.resetPasswordToken = `${otp}`;
    await user.save();

    res.json({ message: "check your inbox please" })
});

exports.otpVarification = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email }).exec();
    if (!user) {
        return next(new ErrorHandler("User not found with this email address", 404));
    }

    if (user.resetPasswordToken !== req.body.otp) {
        return next(new ErrorHandler("Invalid OTP", 404));
    }
    res.status(200).json({
        message: "OTP successfully varified"
    })
})

exports.forgotPasswordToChange = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email }).exec();
    if (!user) {
        return next(new ErrorHandler("User not found with this email address", 404));
    }

    user.resetPasswordToken = "0";
    user.password = req.body.password;
    await user.save();

    res.status(200).json({
        message: "Password successfully changed"
    })
})

exports.userResetPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.id).select("+password").exec();
    const isMatch = user.comparePassword(req.body.oldPassword);
    if (!isMatch) { return next(new ErrorHandler("Wrong Password", 500)) }
    user.password = req.body.newPassword;
    await user.save();
    res.status(200).json({
        message: "Password successfuly reset"
    })
    sendToken(user, 201, res);
});

exports.userUpdate = catchAsyncErrors(async (req, res, next) => {
    await User.findByIdAndUpdate(req.id, req.body).exec();
    res.status(200).json({
        success: true,
        message: "User Updated Successfully !"
    })
});

exports.chat = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.id).exec();
    const allUser = await User.find().exec();
    res.json({ user, allUser });
});

exports.chatwithUser = catchAsyncErrors(async (req, res, next) => {
    let receaver = await User.findById(req.body.id).populate('chats').exec();
    receaver.chats.forEach((e)=> {
        if(e.receaver == req.id || e.sender == req.id) e.msg = decryption(e);
    })
    res.json(receaver);
});

exports.invite = catchAsyncErrors(async (req, res, next) => {
    console.log(req.body.contact)
    const user = await User.find({ contact: { $regex: req.body.contact } }).exec();
    res.json({ user });
});

exports.newChat = catchAsyncErrors(async (req, res, next) => {
    console.log(req.body.id)
    const user = await User.findById(req.body.id).exec();
    const loggedinUser = await User.findById(req.id).exec();
    loggedinUser.friend.push(req.body.id);
    user.friend.push(req.id);
    loggedinUser.save();
    user.save();
    res.json({ user });
});

exports.msgUpload = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ contact: req.body.receaver }).exec();
    const loggedinUser = await User.findById(req.id).exec();
    const data = encryption(req.body.msg);
    const message = await new Message({ sender: req.id, receaver: user._id, msg: data.msg, iv: data.iv }).save();
    loggedinUser.chats.push(message._id);
    user.chats.push(message._id);
    loggedinUser.save();
    user.save();
});

const encryption = (msg) => {
    try {
        const cypher = crypto.createCipheriv(algorithm, key, iv);
        let encryptData = cypher.update(msg, "utf-8", "hex");
        encryptData += cypher.final("hex");
        // for mongodb formate
        const base64Data = Buffer.from(iv, 'binary').toString('base64');
        return { msg: encryptData, iv: base64Data };
    } catch (error) {
        console.log(error)
    }
}

const decryption = (obj) => {
    try {
        const originalData = Buffer.from(obj.iv, 'base64');
        const decypher = crypto.createDecipheriv(algorithm, key, originalData);
        let decryptData = decypher.update(obj.msg, "hex", "utf-8");
        decryptData += decypher.final("utf-8");
        return decryptData;
    } catch (error) {
        console.log(error)
    }
}