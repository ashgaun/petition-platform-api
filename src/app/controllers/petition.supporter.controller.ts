import {Request, Response} from "express";
import Logger from "../../config/logger";
import * as supporters from "../models/petition_support_model";
import * as users from "../models/user_model";
import * as petitions from "../models/petition_model";
import * as supportTiers from "../models/petition_supportTiers_model";
import { validate } from "../../config/ajv";
import * as schemas from '../resources/schemas.json';

const getAllSupportersForPetition = async (req: Request, res: Response): Promise<void> => {
    try{
        const petitionId = parseInt(req.params.id,10);
        if (isNaN(petitionId)) {
            res.statusMessage = "Should be a number!";
            res.status(404).send();
            return;
        }
        const allSupporters = await supporters.getAllSuppporters(petitionId);
        res.status(200).send(allSupporters);

    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const addSupporter = async (req: Request, res: Response): Promise<void> => {
    try{
        const valid = await validate(schemas.support_post, req.body);
        if (valid !== true) {
            res.statusMessage = "Invalid body!";
            res.status(400).send();
            return;
        }
        const token = req.header('X-Authorization');
        const user  = await users.getUserByToken(token);
        const petitionId = parseInt(req.params.id,10);
        if (isNaN(petitionId)) {
            res.statusMessage = "Should be a number!";
            res.status(404).send();
            return;
        }
        const petition = await petitions.getPetitionsById(petitionId);
        if(petition.length === 0){
            res.statusMessage = "Petition not found!";
            res.status(404).send();
            return;
        }
        if(petition[0].ownerId === user[0].id){
            res.statusMessage = "Can't support your own petition!";
            res.status(403).send();
            return;
        }
        const supportTierId = parseInt(req.body.supportTierId,10);
        const message = req.body.message;
        if (isNaN(supportTierId)) {
            res.statusMessage = "Should be a number!";
            res.status(404).send();
            return;
        }
        const supportTier = await supportTiers.getSupportTierBySupportTierId(supportTierId);
        if(supportTier.length === 0){
            res.statusMessage = "Support Tier not found!";
            res.status(404).send();
            return;
        }
        const supporter = await supporters.checkSupporter(petitionId, user[0].id, supportTierId);
        if(supporter === undefined){
            res.statusMessage = "Already supported!";
            res.status(403).send();
            return;
        }
        await supporters.addSupporter(petitionId, user[0].id, supportTierId, message);
        res.statusMessage = "Supporter added!";
        res.status(201).send();
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

export {getAllSupportersForPetition, addSupporter}