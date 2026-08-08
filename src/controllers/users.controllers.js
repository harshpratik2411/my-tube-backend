import asyncHandler from "../utils/asyncHandler.js";
import  ApiError  from "../utils/ApiError.js";
import { User} from '../models/user.model.js'
import uploadOnCloudinary from '../utils/Cloudniary.js'
import ApiResponse from "../utils/ApiResponse.js";

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
  const  existedUser = await User.findOne({
    $or: [{username},{email}]
   }) 
   if (existedUser) {
     throw new ApiError(409, "User with this username and email already exists")
   } 
   const avatarLocalPath = req.files?.avatar[0]?.path; 
const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    
   if (!avatarLocalPath) {
     throw new ApiError(400,"Avtar file is required")
   } 
   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath) 
    if (!avatar) {
     throw new ApiError(400,"Avtar file is required")
   } 
   const user = await  User.create({
       fullName,
       avatar:avatar.url,
       coverImage:coverImage?.url || "",
       email,
       password,
       username:username.toLowerCase()

    }) 

    const createduser = await User.findById(user._id).select(
      "-password -refreshToken"
    ) 
    if (!createduser) {
         throw new ApiError(500,"Something went wrong while registring the user")
    } 
    return res.status(201).json(
      new ApiResponse(200, createduser,"User Created Successfully")
    )
}); 
export { registerUser };
