import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // node builtin to read/write/remove files

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});





const safeUnlink = (path?: string | null) => {
  if (!path) return;
  try {
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
    }
  } catch (_err) {
    // ignore unlink errors (best effort cleanup)
  }
};

const uploadOnCloudinary = async (localFilePath?: string | null): Promise<any | null> => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfully
    console.log("file is uploaded on cloudinary ", (response as any)?.url);
    safeUnlink(localFilePath);
    return response;
  } catch (error) {
    // remove the locally saved temporary file as the upload operation got failed
    console.error("❌ Cloudinary upload failed:", error);
    safeUnlink(localFilePath);
    return null;
  }
};

const deleteFromCloudinaryByUrl = async (fileUrl?: string | null): Promise<boolean> => {
  try {
    if (!fileUrl) return false;
    const url = String(fileUrl).split("?")[0]?.split("#")[0];
    if (!url) return false;
    const parts = url.split("/");
    const uploadIndex = parts.findIndex((p) => p === "upload");
    if (uploadIndex === -1) return false;

    let publicId = parts.slice(uploadIndex + 1).join("/");

    publicId = publicId.replace(/^v\d+\//, "");

    publicId = publicId.replace(/\.[a-zA-Z0-9]+$/, "");

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "auto",
    });

    // result may be an object like { result: 'ok' } or { result: 'not found' }
    return result?.result === "ok" || result?.result === "not found";
  } catch (_error) {
    return false;
  }
};

export { uploadOnCloudinary, deleteFromCloudinaryByUrl };