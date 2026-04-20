import * as fs from 'fs';
import * as path from 'path';

/**
 * Saves a file from memory to disk in a given directory
 * @param file - Multer file from memoryStorage
 * @param directory - Folder inside /uploads (e.g., 'user', 'profile')
 * @param filenamePrefix - Optional prefix like 'user' or 'avatar'
 * @returns The relative file path to store in the database
 */
export function saveFileToDisk(
  file: Express.Multer.File,
  directory: string = 'other',
  filenamePrefix: string = 'file',
): string {
  const timestamp = Date.now();
  const ext = path.extname(file.originalname);
  const safePrefix = filenamePrefix.replace(/\W+/g, '_');
  const filename = `${safePrefix}-${timestamp}${ext}`;

  const uploadDir = path.join(__dirname, '..', '..', 'uploads', directory);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fullPath = path.join(uploadDir, filename);
  fs.writeFileSync(fullPath, file.buffer as Uint8Array);

  return `uploads/${directory}/${filename}`;
}
