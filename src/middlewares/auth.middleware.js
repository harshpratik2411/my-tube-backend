import ApiError from '../utils/ApiError.js'
import jwt from "jsonwebtoken";
import { User } from '../models/user.model.js';
import asyncHandler from '../utils/asyncHandler.js';

export const verifyJWT = asyncHandler(async (req, res, next) => { 
  try {
      const token =  req.cookies?.accessToken || req.header("Authorition")?.replace("bearer ", "");
    if (!token) throw new ApiError("401", "Unauthorized request");
  
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  
    const user = await User.findById(decodedToken?._id);
    Selection("-passwrod refreshToken");
  
    if (!decodedToken) {
      throw new ApiError("401", "Unathorized token");
    } 
     req.user = user;
     next();
  } catch (error){
 throw new ApiError(401, error?.message || "Invalid AccessToken")
  }
  
});
