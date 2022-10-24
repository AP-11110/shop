import express from "express";
import { verifyTokenAndAuthorization, verifyTokenAndAdmin, verifyToken } from "../verifyToken.js";
import Order from "../models/Order.js";
import { createError } from "../error.js";

const router = express.Router();

// create
router.post("/", verifyToken, async (req, res, next) => {
    const newOrder = new Order(req.body);
    try {
        const savedOrder = await newOrder.save();
        res.status(200).json(savedOrder);
    } catch (err) {
        next(err)
    }
})

// update order
router.put("/:id", verifyTokenAndAdmin, async (req, res, next) => {

   try {
      const updatedOrder = await Order.findByIdAndUpdate(req.params.id, {
        $set: req.body
      }, { new: true })
      if(!updatedOrder) next(createError(404, "Order doesn't exist"));
      res.status(200).json(updatedOrder);
   } catch (err) {
      next(err);
   }
})

// // delete order
router.delete("/:id", verifyTokenAndAdmin, async (req, res, next) => {
  
   try {
      const order = await Order.findByIdAndDelete(req.params.id);
      if(!order) next(createError(404, "order doesn't exist"));
      else {
         res.status(200).send("order deleted");
      }
   } catch(err) {
      next(err);
   }
})

// get user orders
router.get("/find/:userId", verifyTokenAndAuthorization, async (req, res, next) => {
    try {
      const orders = await Order.find({ userId: req.params.userId });
      res.status(200).json(orders);
    } catch (err) {
      next(err);
    }
  });
  
// get all
router.get("/", verifyTokenAndAdmin, async (req, res, next) => {
    try {
      const orders = await Order.find();
      res.status(200).json(orders);
    } catch (err) {
      next(err);
    }
});

// get monthly income
router.get("/income", verifyTokenAndAdmin, async (req, res, next) => {
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    const previousMonth = new Date(date.setMonth(lastMonth.getMonth() - 1));
    try {
        const income = await Order.aggregate([
            // only earnings for the last 2 months
            { $match: { createdAt: { $gte: previousMonth }}},
            {
                $project: {
                    month: { $month: "$createdAt" },
                    sales: "$amount"
                }
            },
            {
                $group: {
                    _id: "$month",
                    total: {$sum: "$sales"}
                }
            }
        ]);
        res.status(200).json(income);
    } catch (err) {
        next(err);
    }
})


export default router;