import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/users.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessTokenAndRefreshToken = async (userId) => {

  try{
  const user = await User.findById(userId);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({validateBeforeSave: false});

  return { accessToken, refreshToken };
  }catch(error){
    throw new ApiError(500, "Error generating access token and refresh token");
  }
}


const registerUser = asyncHandler(async (req, res) => {
    console.log("=== REQUEST DEBUG INFO ===");
    console.log("FILES RECEIVED ===>", req.files);
    console.log("BODY RECEIVED ===>", req.body);
    console.log("HEADERS ===>", req.headers);
    console.log("CONTENT-TYPE ===>", req.get('Content-Type'));
    
    // Debug environment variables
    console.log("Cloudinary Config Check:");
    console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "Set" : "Not set");
    console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "Set" : "Not set");
    console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "Set" : "Not set");

  const { fullName, email, username, password } = req.body;
  console.log("email", email);

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "username or email with this are already exists");
  }

  // Check if files exist in the request
  if (!req.files || !req.files.avatar) {
    throw new ApiError(400, "Avatar file is required. Please upload an image file.");
  }

  const avatarFileArray = req.files?.avatar;
  const coverImageArray = req.files?.coverImage;

  console.log("Avatar file array:", avatarFileArray);
  console.log("Cover image array:", coverImageArray);

  const avatarLocalPath = avatarFileArray?.[0]?.path;
  const coverImageLocalPath = coverImageArray?.[0]?.path;

  console.log("Avatar local path:", avatarLocalPath);
  console.log("Cover image local path:", coverImageLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required.");
  }

  // Check if the file actually exists on disk
  const fs = await import('fs');
  if (!fs.existsSync(avatarLocalPath)) {
    console.error(`Avatar file does not exist at path: ${avatarLocalPath}`);
    throw new ApiError(400, "Avatar file was not saved properly. Please try again.");
  }

  console.log(`Avatar file exists at: ${avatarLocalPath}`);
  console.log(`Avatar file size: ${fs.statSync(avatarLocalPath).size} bytes`);

  console.log("About to upload avatar to Cloudinary...");
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  console.log("Avatar upload result:", avatar);
  
  // Check if avatar file still exists after upload attempt
  console.log("Avatar file exists after upload attempt:", fs.existsSync(avatarLocalPath));
  
  console.log("About to upload cover image to Cloudinary...");
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  console.log("Cover image upload result:", coverImage);
  
  // Check if cover image file still exists after upload attempt
  console.log("Cover image file exists after upload attempt:", coverImageLocalPath ? fs.existsSync(coverImageLocalPath) : "No cover image");

  if (!avatar) {
    console.error("Avatar upload failed - returning error to client");
    
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new ApiError(400, "Cloudinary is not configured. Please set up your CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.");
    }
    
    // For debugging, let's create a temporary user without Cloudinary upload
    console.log("Creating user with local file path for debugging...");
    const user = await User.create({
      fullName,
      avatar: avatarLocalPath, // Use local path temporarily
      coverImage: coverImageLocalPath || "",
      email,
      password,
      username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user.");
    }

    return res.status(201).json(
      new ApiResponse(200, createdUser, "User registered successfully (with local file path for debugging).")
    );
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });


   const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
   )

   if(!createdUser){
    throw new ApiError(500,"Something went wrong while registering the user.")
   }

   return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered successfully.")
   )

});

const testEndpoint = asyncHandler(async (req, res) => {
  // Test Cloudinary configuration directly
  const cloudinaryModule = await import('cloudinary');
  const cloudinary = cloudinaryModule.v2;
  
  cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
  });
  
  return res.status(200).json(
    new ApiResponse(200, {
      message: "API is working!",
      cloudinaryConfigured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET),
      envVars: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME ? "Set" : "Not set",
        apiKey: process.env.CLOUDINARY_API_KEY ? "Set" : "Not set",
        apiSecret: process.env.CLOUDINARY_API_SECRET ? "Set" : "Not set"
      },
      cloudinaryDetails: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKeyLength: process.env.CLOUDINARY_API_KEY ? process.env.CLOUDINARY_API_KEY.length : 0,
        apiSecretLength: process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.length : 0
      },
      cloudinaryConfig: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET ? "***" + process.env.CLOUDINARY_API_SECRET.slice(-4) : "undefined"
      }
    }, "Test endpoint working")
  );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if(!email && !username){
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if(!user){
    throw new ApiError(400, "Invalid username or email");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if(!isPasswordCorrect){
    throw new ApiError(400, "Invalid password");
  }

  const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
  }

  return res.status(200)
 .cookie("refreshToken", refreshToken, options)
 .cookie("accessToken", accessToken, options)
 .json(
  new ApiResponse(
    200,
    {
      user: loggedInUser,accessToken,refreshToken
    }, "User logged in successfully")
 )
})

const logoutUser = asyncHandler(async(req, res) => {
  await User.findByIdAndUpdate(
      req.user._id,
      {
          $unset: {
              refreshToken: 1 // this removes the field from document
          }
      },
      {
          new: true
      }
  )

  const options = {
      httpOnly: true,
      secure: true
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, {}, "User logged Out"))
})


const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
      throw new ApiError(401, "unauthorized request")
  }

  try {
      const decodedToken = jwt.verify(
          incomingRefreshToken,
          process.env.REFRESH_TOKEN_SECRET
      )
  
      const user = await User.findById(decodedToken?._id)
  
      if (!user) {
          throw new ApiError(401, "Invalid refresh token")
      }
  
      if (incomingRefreshToken !== user?.refreshToken) {
          throw new ApiError(401, "Refresh token is expired or used")
          
      }
  
      const options = {
          httpOnly: true,
          secure: true
      }
  
      const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
  
      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
          new ApiResponse(
              200, 
              {accessToken, refreshToken: newRefreshToken},
              "Access token refreshed"
          )
      )
  } catch (error) {
      throw new ApiError(401, error?.message || "Invalid refresh token")
  }

})



export { registerUser, testEndpoint , loginUser, logoutUser, refreshAccessToken};
