import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/users.models.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";




const registerUser = asyncHandler(async(req,res) => {
   const {fullName, email, username, password} = req.body
   console.log("email",email);

   if(
    [fullName,email,username,password].some((field) => field?.trim()==="")
   )
   {
    throw new ApiError(400,"All fields are required")
   }

   const existedUser = User.findOne({
    $or: [{ username },{ email }]
   })

   if(existedUser)
   {
    throw new ApiError(409,"username or email with this are already exists")
   }

   const avatarLocalPath = req.files?.avatar[0]?.path;
   const coverImageLocalPath = req.files?.coverImage[0]?.path;

   if(!avatarLocalPath)
   {
       throw new ApiError(400,"Avatar file is required.")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   if(!avatar)
   {
       throw new ApiError(400,"Avatar file is required.")
   }

})

export {registerUser}