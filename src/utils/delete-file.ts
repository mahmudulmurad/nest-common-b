import * as fs from 'fs';
import * as path from 'path';

export interface DeleteFileStatus {
  success: boolean;
  message: string;
  path?: string;
}

/**
 * Deletes a file from disk if it exists.
 * @param relativePath Relative file path (e.g., 'uploads/product/image.jpg')
 * @returns { success, message, path }
 */
export function deleteFileFromDisk(relativePath: string): DeleteFileStatus {
  if (!relativePath) {
    return {
      success: false,
      message: 'No path provided',
    };
  }

  const fullPath = path.join(__dirname, '..', '..', relativePath);
  try {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return {
        success: true,
        message: 'File deleted successfully',
        path: relativePath,
      };
    } else {
      return {
        success: false,
        message: 'File does not exist',
        path: relativePath,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to delete file: ${error.message}`,
      path: relativePath,
    };
  }
}
