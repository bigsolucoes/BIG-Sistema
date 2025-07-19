
// This is a mock implementation of a Vercel Blob-like service
// using localStorage for this frontend-only environment.
// The interface is designed to be easily replaced with actual API calls
// to a backend service that uses Vercel Blob.

const getBlobKey = (userId: string, key: string): string => {
  return `vercel_blob_${userId}_${key}`;
};

/**
 * Simulates fetching data from a blob store.
 * @param userId - The ID of the current user.
 * @param key - The key for the data (e.g., 'jobs', 'clients').
 * @returns The parsed data or null if not found.
 */
export const get = async <T>(userId: string, key: string): Promise<T | null> => {
  try {
    const blobKey = getBlobKey(userId, key);
    const data = localStorage.getItem(blobKey);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`[BlobService] Error getting data for key ${key}:`, error);
    return null;
  }
};

/**
 * Simulates uploading/setting data in a blob store.
 * @param userId - The ID of the current user.
 * @param key - The key for the data.
 * @param data - The data to store.
 */
export const set = async (userId: string, key: string, data: unknown): Promise<void> => {
  try {
    const blobKey = getBlobKey(userId, key);
    localStorage.setItem(blobKey, JSON.stringify(data));
  } catch (error) {
    console.error(`[BlobService] Error setting data for key ${key}:`, error);
    throw error;
  }
};

/**
 * Simulates deleting data from a blob store.
 * @param userId - The ID of the current user.
 * @param key - The key of the data to delete.
 */
export const del = async (userId: string, key: string): Promise<void> => {
  try {
    const blobKey = getBlobKey(userId, key);
    localStorage.removeItem(blobKey);
  } catch (error) {
    console.error(`[BlobService] Error deleting data for key ${key}:`, error);
  }
};
