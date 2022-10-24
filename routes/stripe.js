import express from "express";
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_KEY);
import { createError } from "../error.js";
const router = express.Router();


router.post("/payment", (req, res, next) => {
    stripe.charges.create({
        source: req.body.tokenId,
        amount: req.body.amount,
        currency: "usd",
    }, (stripeErr, stripeRes) => {
        if(stripeErr) {
            next(stripeErr);
        } else {
            res.status(200).json(stripeRes);
        }
    })
})


export default router;