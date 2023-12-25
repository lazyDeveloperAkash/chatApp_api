const express = require("express");
const router = express.Router();
const { isAuthenticate } = require("../middlewares/auth")
const { homePage, currentUser, userSingup, userSinginEmail, userSinginContact, userSingout, chatwithUser, userAvatar, sendMail, otpVarification, forgotPasswordToChange, userUpdate, userResetPassword, invite, newChat, msgUpload } = require("../controllers/indexController");

router.get("/", homePage);
router.get("/user", isAuthenticate, currentUser);

router.post("/singup", userSingup);
router.post("/singin/email", userSinginEmail);
router.post("/singin/contact", userSinginContact);
router.get("/singout", isAuthenticate, userSingout);

// update profile
router.post("/update-profile", isAuthenticate, userUpdate);

// change password
router.post("/update-password", isAuthenticate, userResetPassword);

//send email
router.post("/send-email", sendMail);

//otp varification
router.post("/otp-varification", otpVarification);

//forget the password
router.post("/forget-password-change", forgotPasswordToChange);

//avatar
router.post("/upload-profile-picture", isAuthenticate, userAvatar);

//--------------------------------CRED-------------------------------------------

// invite 
router.post("/invite", isAuthenticate, invite);

//new chat
router.post("/new-chat", isAuthenticate, newChat);

// get details for onclick
router.post("/chat", isAuthenticate, chatwithUser);

// message upload
router.post("/msg-upload", isAuthenticate, msgUpload);


module.exports = router;