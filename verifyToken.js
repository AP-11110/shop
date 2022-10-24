import jwt from "jsonwebtoken";
import { createError } from "./error.js";

export const verifyToken = (req, res, next) => {

    // retrieving token from the cookies
    const token = req.cookies.access_token;
    if(!token) next(createError(401, "You are not authenticated"));

     // validating the token
    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if(err) return next(createError(403, "token is not valid"));

        // if valid, store the user info in the request
        req.user = user;
        next();
    })
}

// checking whether token & user id matches or if user is admin
export const verifyTokenAndAuthorization = (req, res, next) => {
    verifyToken(req, res, () => {
      if(req.params.id === req.user.id || req.user.isAdmin) {
        next();
      } else {
        next(createError(401, "You are not alowed to do that!"));
      }
    });
  };

// checking whether user is admin
export const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      next(createError(401, "You are not alowed to do that!"));
    }
  });
};