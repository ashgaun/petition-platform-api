import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as petitions from '../models/petition_model';
import * as petitionImage from '../models/petition_image';
const getImage = async (req: Request, res: Response): Promise<void> => {
    try{
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.statusMessage = "Id must be an integer"
            res.status(404).send();
            return;
        }
        const fileName = await petitions.getImageName(id);
        if (fileName === null) {
            res.statusMessage = "No image found"
            res.status(404).send();
            return;
        }
        const [image, mimeType] = await petitionImage.readImage(fileName);
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
    try{
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.statusMessage = "Id must be an integer"
            res.status(404).send();
            return;
        }
        const image = req.body;
        const petition = await petitions.getPetitionsById(id);
        if (petition.length === 0) {
            res.status(403).send("no such petition");
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
            res.status(400).send("Please use the right format for images");
            return;
        }
        if (image.length === undefined) {
            res.status(403).send("no image uploaded");
            return;
        }
        const fileName = await petitions.getImageName(id)
        if (fileName != null && fileName !== "") {
            await petitionImage.deleteImages(fileName);
            res.status(200).send()
        }
        const newFileName = await petitionImage.putImage(image, extension);
        await petitions.putImageName(id, newFileName);
        res.status(201).send()
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}


export {getImage, setImage};