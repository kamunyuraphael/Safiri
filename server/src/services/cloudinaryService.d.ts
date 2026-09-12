export interface CloudinaryUploadResult {
    url: string;
    publicId: string;
}
/**
 * Uploads an image to Cloudinary directly from a remote URL (e.g. an
 * Unsplash result) without downloading it locally first — Cloudinary
 * fetches it server-side. Used by the seed script so destinations end
 * up with permanent Cloudinary URLs instead of third-party hotlinks.
 */
export declare function uploadImageFromUrl(imageUrl: string, folder?: string): Promise<CloudinaryUploadResult>;
/**
 * Uploads an image from an in-memory buffer (e.g. a user's review photo
 * submitted via multipart form upload). Used with upload.middleware.ts.
 */
export declare function uploadImageFromBuffer(buffer: Buffer, folder?: string): Promise<CloudinaryUploadResult>;
/**
 * Deletes an image from Cloudinary by its publicId — e.g. when a
 * review or its image is removed.
 */
export declare function deleteImage(publicId: string): Promise<void>;
//# sourceMappingURL=cloudinaryService.d.ts.map