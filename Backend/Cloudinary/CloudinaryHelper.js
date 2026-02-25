import cloudinary from "./Cloudinary.js";
import streamifier from "streamifier";

export const uploadToCloudinary = (fileBuffer, folderName) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        transformation: [
          { width: 1200, crop: "limit", fetch_format: "auto", quality: "auto" }
        ]
      },
      (error, result) => {
        if (result) {
          const optimizedUrl = result.secure_url?.includes("/upload/")
            ? result.secure_url.replace(
                "/upload/",
                "/upload/f_auto,q_auto,c_limit,w_1200/"
              )
            : result.secure_url;
          resolve({
            success: true,
            url: optimizedUrl,
            public_id: result.public_id,
          });
        } else {
          reject({ success: false, error });
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// ================= DELETE =================
export const deleteFromCloudinary = async (publicId) => {
  const result = await cloudinary.uploader.destroy(publicId);
  return result;
};

// ================= UPDATE =================
export const updateCloudinaryImage = async (oldPublicId, fileBuffer, folderName) => {
  if (oldPublicId) {
    await deleteFromCloudinary(oldPublicId);
  }

  const uploadResult = await uploadToCloudinary(fileBuffer, folderName);
  return uploadResult;
};
