import express from "express";
import { verifyTokenAndAuthorization, verifyTokenAndAdmin, verifyToken } from "../verifyToken.js";
import Cart from "../models/Cart.js";
import { createError } from "../error.js";

const router = express.Router();

// create
router.post("/", verifyToken, async (req, res, next) => {
    const newCart = new Cart(req.body);
    try {
        const savedCart = await newCart.save();
        res.status(200).json(savedCart);
    } catch (err) {
        next(err)
    }
})

// update cart
router.put("/:id", verifyTokenAndAuthorization, async (req, res, next) => {

   try {
      const updatedCart = await Cart.findByIdAndUpdate(req.params.id, {
        $set: req.body
      }, { new: true })
      if(!updatedCart) next(createError(404, "Cart doesn't exist"));
      res.status(200).json(updatedCart);
   } catch (err) {
      next(err);
   }
})

// delete cart
router.delete("/:id", verifyTokenAndAuthorization, async (req, res, next) => {
  
   try {
      const cart = await Cart.findByIdAndDelete(req.params.id);
      if(!cart) next(createError(404, "cart doesn't exist"));
      else {
         res.status(200).send("cart deleted");
      }
   } catch(err) {
      next(err);
   }
})

// get user cart
router.get("/find/:userId", verifyTokenAndAuthorization, async (req, res, next) => {
   try {
      const cart = await Cart.findOne({userId: req.params.userId});
      res.status(200).json(cart);
   } catch(err) {
      next(err);
   }
})

// get all
router.get("/", verifyTokenAndAdmin, async (req, res, next) => {
    try {
       const carts = await Cart.find();
       res.status(200).json(carts);
    } catch(err) {
       next(err);
    }
 })

export default router;