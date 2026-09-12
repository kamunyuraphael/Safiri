import { IDestinationImage } from "../models/Destination.model";
/**
 * Fetches up to `count` images for a search query from Unsplash, then
 * transfers each one to Cloudinary so the stored URL is permanent and
 * under your own control rather than a third-party hotlink. If no
 * Unsplash key is configured, returns an empty array rather than
 * failing the whole seed run — destinations can still be seeded
 * without images and backfilled later.
 */
export declare function fetchDestinationImages(query: string, count?: number): Promise<IDestinationImage[]>;
//# sourceMappingURL=fetchImages.d.ts.map