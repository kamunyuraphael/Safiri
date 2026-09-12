import cloudinary from "../config/cloudinary";
import { UploadApiResponse } from "cloudinary";

export interface CloudinaryUploadResult {
  url: string;       // secure_url — permanent Cloudinary CDN link
  publicId: string;  // needed later if you ever want to delete/replace the image
}

/**
 * Uploads an image to Cloudinary directly from a remote URL (e.g. an
 * Unsplash result) without downloading it locally first — Cloudinary
 * fetches it server-side. Used by the seed script so destinations end
 * up with permanent Cloudinary URLs instead of third-party hotlinks.
 */
export async function uploadImageFromUrl(
  imageUrl: string,
  folder = "safiri/destinations"
): Promise<CloudinaryUploadResult> {
  const result: UploadApiResponse = await cloudinary.uploader.upload(imageUrl, {
    folder,
    resource_type: "image",
  });

  return { url: result.secure_url, publicId: result.public_id };
}

/**
 * Uploads an image from an in-memory buffer (e.g. a user's review photo
 * submitted via multipart form upload). Used with upload.middleware.ts.
 */
export function uploadImageFromBuffer(
  buffer: Buffer,
  folder = "safiri/reviews"
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    uploadStream.end(buffer);
  });
}

/**
 * Deletes an image from Cloudinary by its publicId — e.g. when a
 * review or its image is removed.
 */
export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
