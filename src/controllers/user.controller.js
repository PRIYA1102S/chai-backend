import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/users.models.js";

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

})

export {registerUser}