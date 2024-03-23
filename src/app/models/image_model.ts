import { fs } from "mz";
import Logger from "../../config/logger";
import { randomUUID } from "node:crypto";
import * as path from 'path';

const filepath = './storage/images/';

const readImage = async (fileName: string): Promise<[Buffer, string]> => {
    const image = await fs.readFile(filepath + fileName);
    const extension = path.extname(fileName).toLowerCase();
    const mimeTypes: { [extension: string]: string } = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
    };
    const mimetype = mimeTypes[extension]
    return [image, mimetype];

}
const putImage = async (image: Buffer, ext: string): Promise<string> => {
    const fileName = randomUUID() + ext;
    const fullPath = `${filepath}${fileName}`;

    try {
        await fs.writeFile(fullPath, image);
        return fileName;
    } catch (err) {
        Logger.error(err);
        throw err;
    }
}
const deleteImages = async (fileName: string): Promise<void> => {
    if (fileName) {
        if (await fs.exists(filepath + fileName)) {
            await fs.unlink(filepath + fileName);
        }
    }
}


export { readImage, putImage, deleteImages };





