import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const uploadOnCloudinary = async (localFilePath) => {
    try{
      if(!localFilePath) return null;

      // Check if Cloudinary is configured
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error("Cloudinary configuration missing. Please check your environment variables.");
        console.error("Required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET");
        return null;
      }

      // Check if file exists
      if (!fs.existsSync(localFilePath)) {
        console.error(`File not found: ${localFilePath}`);
        return null;
      }

      console.log("Uploading to Cloudinary:", localFilePath);
      console.log("Cloudinary config check:");
      console.log("- Cloud name:", process.env.CLOUDINARY_CLOUD_NAME);
      console.log("- API key length:", process.env.CLOUDINARY_API_KEY ? process.env.CLOUDINARY_API_KEY.length : "Not set");
      console.log("- API secret length:", process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.length : "Not set");
      
      //upload the file on cloudinary
      const response = await cloudinary.uploader.upload(localFilePath,{
        resource_type: "auto"
      })
      
      console.log("Cloudinary upload successful:", response.url);
      
      // file has been uploaded successfully
      fs.unlinkSync(localFilePath)
      return response;
    }
    catch (error){
      console.error("Cloudinary upload error:", error.message);
      
      // Don't delete the file if upload fails - keep it for debugging
      console.log(`File kept at: ${localFilePath} for debugging purposes`);
      return null;
    }
}

export { uploadOnCloudinary }