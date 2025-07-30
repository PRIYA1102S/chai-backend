import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({
  path: './.env'
});

// Debug environment variables loading
console.log("=== ENVIRONMENT VARIABLES CHECK ===");
console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "Loaded" : "Not loaded");
console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "Loaded" : "Not loaded");
console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "Loaded" : "Not loaded");

// Show actual values (be careful with secrets)
console.log("=== ACTUAL VALUES ===");
console.log("CLOUDINARY_CLOUD_NAME value:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("CLOUDINARY_API_KEY value:", process.env.CLOUDINARY_API_KEY);
console.log("CLOUDINARY_API_SECRET value:", process.env.CLOUDINARY_API_SECRET ? "***" + process.env.CLOUDINARY_API_SECRET.slice(-4) : "undefined");

// Configure Cloudinary after environment variables are loaded
import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});
console.log("Cloudinary configured successfully!");

connectDB()

.then(() => {
    app.listen(process.env.PORT || 8000 , () => {
        console.log(`Server is running at PORT : $ {process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGODB Connection Failed!!",err);
})