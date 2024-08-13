exports.sendToken = (user, statusCode, req, res) => {
    const token = user.getJWTToken();

    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    }
    // for domain name
    if (req.hostname === '127.0.0.1' || req.hostname === 'localhost') {
        options.domain = req.hostname;
    }
    else options.domain = 'chat-app-green-seven.vercel.app';

    res.status(statusCode).cookie("token", token, options).json({ user: user, success: true, id: user._id, token });
}