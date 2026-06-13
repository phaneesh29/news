import fs from 'fs/promises';
import path from 'path';

export async function writeNewsFile(filePath, content) {
  try {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
    console.log(`[File Writer] Successfully wrote file to: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`[File Writer] Failed to write file to ${filePath}:`, error.message);
    return false;
  }
}
