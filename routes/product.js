import express from "express";
import { verifyTokenAndAdmin } from "../verifyToken.js";
import Product from "../models/Product.js";
import { createError } from "../error.js";

const router = express.Router();

// create
router.post("/", verifyTokenAndAdmin, async (req, res, next) => {
    const newProduct = new Product(req.body);
    try {
        const savedProduct = await newProduct.save();
        res.status(200).json(savedProduct);
    } catch (err) {
        next(err)
    }
})

// update product
router.put("/:id", verifyTokenAndAdmin, async (req, res, next) => {

   try {
      const updatedProduct = await Product.findByIdAndUpdate(req.params.id, {
        $set: req.body
      }, { new: true })
      if(!updatedProduct) next(createError(404, "Product doesn't exist"));
      res.status(200).json(updatedProduct);
   } catch (err) {
      next(err);
   }
})

// delete product
router.delete("/:id", verifyTokenAndAdmin, async (req, res, next) => {
  
   try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if(!product) next(createError(404, "product doesn't exist"));
      else {
         res.status(200).send("product deleted");
      }
   } catch(err) {
      next(err);
   }
})

// get product
router.get("/find/:id", async (req, res, next) => {
   try {
      const product = await Product.findById(req.params.id);
      res.status(200).json(product);
   } catch(err) {
      next(err);
   }
})

// get product
router.get("/", async (req, res, next) => {
   // query ?new=true
   const qNew = req.query.new; // limit number of user to most recent users
   // query ?category=tshirt
   const qCategory = req.query.category; // limit number of user to most recent users
   try {
      let products;

      if(qNew) {
        // most recent
        products = await Product.find().sort({createdAt: -1}).limit(1);
      } else if(qCategory) {
        // only fetch products that are in the requested category
        products = await Product.find({categories: {
            $in: [qCategory]
        }})
      } else {
        products = await Product.find();
      }

      res.status(200).json(products);
   } catch(err) {
      next(err);
   }
})

export default router;