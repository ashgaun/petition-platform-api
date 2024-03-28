import { Request, Response } from "express";
import * as Users from "../models/user_model";
import { readImage, putImage, deleteImages } from "../models/image_model";
import Logger from "../../config/logger";

const getImage = async (req: Request, res: Response): Promise<void> => {

    try {

        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.statusMessage = "Id must be an integer"
            res.status(404).send();
            return;
        }
        const fileName = await Users.getImageName(id);
        if (fileName === null) {
            res.statusMessage = "No image found"
            res.status(404).send();
            return;
        }
        const [image, mimeType] = await readImage(fileName);
        res.status(200).contentType(mimeType).send(image);
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const setImage = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.statusMessage = "Id must be an integer"
            res.status(404).send();
            return;
        }
        const image = req.body;
        const user = await Users.getOneById(id);
        if (user.length === 0) {
            res.statusMessage = "No such user"
            res.status(403).send();
        }
        if (user[0].auth_token !== req.header('X-Authorization')) {
            res.statusMessage = "Unauthorised"
            res.send(403).send();
        }
        const mimeType = req.header('Content-Type');
        let extension = null
        if (mimeType === 'image/jpeg') {
            extension = '.jpeg';

        }
        if (mimeType === 'image/png') {
            extension = '.png';

        }
        if (mimeType === 'image/gif') {
            extension = '.gif';
        }
        if (extension === null) {
            res.statusMessage = "Invalid image type"
            res.status(403).send();
            return;
        }
        if (image.length === undefined) {
            res.status(403).send();
            return;
        }
        const fileName = await Users.getImageName(id)
        if (fileName != null && fileName !== "") {
            await deleteImages(fileName);
            res.status(200).send()
        }
        const newFileName = await putImage(image, extension);
        await Users.putImageName(id, newFileName);
        res.status(201).send()
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const deleteImage = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.statusMessage = "Id must be an integer"
            res.status(404).send();
            return;
        }
        const user = await Users.getOneById(id);
        if (user.length === 0) {
            res.statusMessage = "User not found";
            res.status(400).send();
        }
        if (user[0].auth_token !== req.header('X-Authorization')) {
            res.statusMessage = "Unauthorized";
            res.status(403).send();
        }
        const fileName = await Users.getImageName(id);
        if (fileName != null && fileName !== "") {
            await deleteImages(fileName);
            await Users.deleteImageName(id);
            res.status(200).send()

        }
        res.status(404).send();
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

export { getImage, setImage, deleteImage }