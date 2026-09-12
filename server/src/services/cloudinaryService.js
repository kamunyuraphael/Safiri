"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImageFromUrl = uploadImageFromUrl;
exports.uploadImageFromBuffer = uploadImageFromBuffer;
exports.deleteImage = deleteImage;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const cloudinary_2 = require("cloudinary");
/**
 * Uploads an image to Cloudinary directly from a remote URL (e.g. an
 * Unsplash result) without downloading it locally first — Cloudinary
 * fetches it server-side. Used by the seed script so destinations end
 * up with permanent Cloudinary URLs instead of third-party hotlinks.
 */
async function uploadImageFromUrl(imageUrl, folder = "safiri/destinations") {
    const result = await cloudinary_1.default.uploader.upload(imageUrl, {
        folder,
        resource_type: "image",
    });
    return { url: result.secure_url, publicId: result.public_id };
}
/**
 * Uploads an image from an in-memory buffer (e.g. a user's review photo
 * submitted via multipart form upload). Used with upload.middleware.ts.
 */
function uploadImageFromBuffer(buffer, folder = "safiri/reviews") {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.default.uploader.upload_stream({ folder, resource_type: "image" }, (error, result) => {
            if (error || !result)
                return reject(error);
            resolve({ url: result.secure_url, publicId: result.public_id });
        });
        uploadStream.end(buffer);
    });
}
/**
 * Deletes an image from Cloudinary by its publicId — e.g. when a
 * review or its image is removed.
 */
async function deleteImage(publicId) {
    await cloudinary_1.default.uploader.destroy(publicId);
}
//# sourceMappingURL=cloudinaryService.js.map