import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/Cloudniary.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js"
import jwt from "jsonwebtoken"
import { response } from "express";

const generateAccessAndRefereshToken = async (userId) => {
  try {
   const  user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access referesh and access token: " + error.message
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  //validation - non empty
  // check if user already exists
  //check  for images ,avatar
  //upload them toh cloudinary
  // create a user object
  // remove password and refresh token feild
  // check for user creation
  // return res
  const { fullName, username, email, password } = req.body;
  console.log("email", email);

  //    if(fullName === "")
  //
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "fullname is required");
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with this username and email already exists");
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avtar file is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avtar file is required");
  }
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createduser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createduser) {
    throw new ApiError(500, "Something went wrong while registring the user");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createduser, "User Created Successfully"));
});
const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "Username or email is  required");
  }
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (!user) {
    throw new ApiError(400, "User does not exist");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid user credentials");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefereshToken(
    user.id
  );
  const loggedInUser = await User.findById(user.id)
  .select("-password -refreshToken"); 

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User LoggedIn Successfully"
      )
    ); 
});
// const logoutUser = asyncHandler( (req,res) =>{
//    User.findByIdAndUpdate(
//     req.user._id, 
//     {
//       $set :  {
//         refreshToken: undefined
//       }  
//     }, {
//        new: true
//     }
//    ) 
//     const options = {
//   httpOnly: true,
//   secure: true,
// }; 
//    return res 
//    .status(200)
//    .clearCookie("accessToken", options)
//    .clearCookie("refreshToken", options)
//    .json(new ApiResponse(200, {}, "User Logged Out Successfully"))

// }) const logoutUser = asyncHandler(async (req, res) => {

    const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "User Logged Out Successfully"
            )
        );
}); 
const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken 

    if (incomingRefreshToken) {
        throw new ApiError(401, "Unauthoried Request")
    } 
     try {
      const decodedToken =  jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET
       ) 
        const user = await User.findById(decodedToken?._id) 
        if(!user){
         throw new ApiError(401,"Invalid Refresh Token")
        } 
        if (incomingRefreshToken !==user.refreshToken) {
          throw new ApiError(401,"Invalid Refresh Token")
        } 
           const optinos = {
             httpOnly: true,
             secure: true
           }
          const {accessToken,newRefreshToken} = await generateAccessAndRefereshToken(user.id)
            return res.status(200)
            .cookie("accessToken", accessToken , optinos)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
             200, 
           {accessToken, refreshToken: newRefreshToken},
           "Access Token refreshed succesfully"
            )
 
          } catch (error) {
             throw new ApiError(400 , error?.message || "Invalid refresh Token" )
          } 
         })


export { registerUser, loginUser ,logoutUser , refreshAccessToken };
 