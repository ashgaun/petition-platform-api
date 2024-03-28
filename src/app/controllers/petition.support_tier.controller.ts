import { Request, Response } from "express";
import Logger from "../../config/logger";
import * as schemas from '../resources/schemas.json';
import { validate } from '../../config/ajv';
import * as support_tier from '../models/petition_supportTiers_model';
import * as petitions from '../models/petition_model';
import * as users from '../models/user_model';
const addSupportTier = async (req: Request, res: Response): Promise<void> => {
    const valid = await validate(schemas.support_tier_post, req.body);
    if (valid !== true) {
        res.status(400).send(valid.toString());
        return;
    }
    try {
        const petitionId = parseInt(req.params.id, 10);
        if (isNaN(petitionId)) {
            res.statusMessage = "Bad Request";
            res.status(400).send();
            return;
        }
        const petition = await petitions.getPetitionsById(petitionId);
        if (petition.length === 0) {
            res.statusMessage = "Not Found";
            res.status(404).send();
            return;
        }
        const title = req.body.title;
        const description = req.body.description;
        const cost = req.body.cost;
        const numberOfTiers = await support_tier.getSupportTiersByPetitionId(petitionId);
        if (numberOfTiers.length >= 3) {
            res.statusMessage = "Forbidden";
            res.status(403).send();
            return;
        }
        const result = await support_tier.putSupportTier(title, description, cost, petitionId);
        res.statusMessage = "Created";
        res.status(201).send();
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const editSupportTier = async (req: Request, res: Response): Promise<void> => {
    try {
        const valid = await validate(schemas.support_tier_patch, req.body);
        if (valid !== true) {
            res.status(400).send(valid.toString());
            return;
        }
        const token = req.header('X-Authorization');
        const petitionId = parseInt(req.params.id, 10);
        const petition = await petitions.getPetitionsById(petitionId);
        const user = await users.getOneById(petition[0].ownerId);
        if (user[0].auth_token !== token) {
            res.statusMessage = "Unauthorised";
            res.status(403).send();
            return;
        }
        if (isNaN(petitionId)) {
            res.statusMessage = "Petition ID must be an integer";
            res.status(400).send();
            return;
        }
        const tierID = parseInt(req.params.tierId, 10);
        if (isNaN(tierID)) {
            res.statusMessage = "Tier ID must be an integer";
            res.status(400).send();
            return;
        }
        const tier = await support_tier.getSupportTierBySupportTierId(tierID);
        let title = req.body.title;
        let description = req.body.description;
        let cost = req.body.cost;
        const supporterexists = await support_tier.getSupportersForSupporterTier(tierID);
        if (supporterexists !== 0) {
            res.statusMessage = "Supporter already exists";
            res.status(403).send();
            return;
        }
        if (title === undefined) {
            title = tier[0].title;
        }
        if (description === undefined) {
            description = tier[0].description;
        }
        if (cost === undefined) {
            cost = tier[0].cost;
        }
        const result = await support_tier.patchSupportTier(title, description, cost, tierID);
        res.statusMessage = "edited supoort tier successfully!";
        res.status(200).send();
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const deleteSupportTier = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.header('X-Authorization');
        const petitionId = parseInt(req.params.id, 10);
        if (isNaN(petitionId)) {
            res.statusMessage = "Petition ID must be an integer";
            res.status(400).send();
            return;
        }
        const petition = await petitions.getPetitionsById(petitionId);
        const user = await users.getOneById(petition[0].ownerId);
        if (user[0].auth_token !== token) {
            res.statusMessage = "Unauthorised";
            res.status(401).send();
            return;
        }
        const tierID = parseInt(req.params.tierId, 10);
        if (isNaN(tierID)) {
            res.statusMessage = "Tier ID must be an integer";
            res.status(400).send();
            return;
        }
        const tier = await support_tier.getSupportTierBySupportTierId(tierID);
        if (tier.length === 0) {
            res.statusMessage = "Not Found";
            res.status(404).send();
            return;
        }
        const supporterexists = await support_tier.getSupportersForSupporterTier(tierID);
        if (supporterexists !== 0) {
            res.statusMessage = "Supporter already exists";
            res.status(403).send();
            return;
        }
        const supporterTiers = await petitions.getsupportertiers(petitionId)
        if(supporterTiers.length===1){
            res.statusMessage = "Cannot delete the last support tier";
            res.status(403).send();
            return;
        }
        const result = await support_tier.deleteSupportTier(tierID);
        res.statusMessage = "Deleted the supporter tier successfully!";
        res.status(200).send();
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

export { addSupportTier, editSupportTier, deleteSupportTier };