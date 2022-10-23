import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createError } from "../error.js"

const router = express.Router();

// register
router.post("/register", async (req, res, next) => {
    
    try {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);

        const newUser = new User({
            ...req.body,
            password: hash,
        });
        const savedUser = await newUser.save();
        res.status(200).json(savedUser);
    } catch (err) {
        next(err)
    }
    
})

// login
router.post("/login", async (req, res, next) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if(!user) return next(createError(404, "User not found"));

        const isCorrect = await bcrypt.compare(req.body.password, user.password);
        if(!isCorrect) return next(createError(400, "Wrong credentials"));

        const {password, ...others} = user._doc;

        // creating token
        // any user information can be passed through {} which will be stored in the token
        const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.SECRET_KEY, { expiresIn: "1d"});

        // sending token
        res.cookie("access_token", token, {
            httpOnly: true
        }).status(200).json(others);
    } catch (err) {
        next(err);
    }
})

export default router;