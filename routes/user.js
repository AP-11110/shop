import express from "express";
import { verifyTokenAndAuthorization } from "../verifyToken.js";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { createError } from "../error.js";

const router = express.Router();

// update user
router.put("/:id", verifyTokenAndAuthorization, async (req, res, next) => {

   // in case user wants to update password
   if(req.body.password) {
      const salt = bcrypt.genSaltSync(10);
      req.body.password = bcrypt.hashSync(req.body.password, salt);
   }

   try {
      const updatedUser = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body
      }, { new: true })
      if(!updatedUser) next(createError(404, "User doesn't exist"));
      res.status(200).json(updatedUser);
   } catch (err) {
      next(err);
   }
})

// delete user
router.delete("/:id", verifyTokenAndAuthorization, async (req, res, next) => {
  
   try {
      const user = await User.findByIdAndDelete(req.params.id);
      if(!user) next(createError(404, "User doesn't exist"));
      else {
         res.status(200).send("User deleted");
      }
   } catch(err) {
      next(err);
   }
})

// get user
router.get("/find/:id", verifyTokenAndAuthorization, async (req, res, next) => {
   try {
      const user = await User.findById(req.params.id);
      const { password, ...others } = user._doc;
      res.status(200).json(others);
   } catch(err) {
      next(err);
   }
})

// get users
router.get("/", verifyTokenAndAuthorization, async (req, res, next) => {
   const query = req.query.new; // limit number of user to most recent users
   try {
      // if api/users?new=true, return most recent, else all
      const users = query ? await User.find().sort({ _id: -1 }).limit(5) : await User.find();
      res.status(200).json(users);
   } catch(err) {
      next(err);
   }
})

// get user stats


export default router;