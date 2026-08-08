import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      throw new Error("Local file path is required for upload.");
    }
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: "uploads",
      use_filename: true,
      unique_filename: false, 
      resourse_type: "auto",
    });
    fs.unlinkSync(localFilePath); // Delete the local file after successful upload
    return result;
  } catch (error) {
    fs.unlinkSync(localFilePath); // Delete the local file in case of error
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
}; 
export default uploadOnCloudinary;
