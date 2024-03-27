import { Request, Response } from "express";
import Logger from '../../config/logger';
import * as petitions from '../models/petition_model';
import * as users from '../models/user_model';
import * as schemas from '../resources/schemas.json';
import { validate } from '../../config/ajv';
const getAllPetitions = async (req: Request, res: Response): Promise<void> => {
    const valid = await validate(schemas.petition_search, req.query);
    if (valid !== true) {
        res.status(400).send(valid.toString());
        return;
    }
    const validSortOptions = ['ALPHABETICAL_ASC', 'ALPHABETICAL_DESC', 'COST_ASC', 'COST_DESC', 'CREATED_ASC', 'CREATED_DESC'];
    const sortBy = req.query.sortBy === undefined ? null : req.query.sortBy.toString();
    const categoryIds = req.query.categoryIds === undefined ? null : req.query.categoryIds.toString().split(',').map(id => parseInt(id, 10));
    const supportingCost = req.query.supportingCost === undefined ? null : parseInt(req.query.supportingCost as string, 10);
    const ownerId = req.query.ownerId === undefined ? null :parseInt(req.query.ownerId as string, 10);
    const supporterId = req.query.supporterId === undefined ? null : parseInt(req.query.supporterId as string, 10);
    const q = req.query.q === undefined ? null : req.query.q.toString().toLowerCase();
    if (req.query.q === "") {
        res.status(400).send();
        return;
    }
    if (sortBy && !validSortOptions.includes(sortBy)) {
        res.status(400).send("Invalid sort option");
        return;
    }

    try {
        if (isNaN(supporterId) || isNaN(ownerId) || isNaN(supportingCost)) {
            res.status(400).send("The supporterId or ownerId or supportingCost is not a number");
            return;
        }
        let sort = ""
        if (sortBy !== null) {
            switch (sortBy) {
                case "ALPHABETICAL_ASC":
                    sort = "p.title ASC";
                    break;
                case "ALPHABETICAL_DESC":
                    sort = "p.title DESC";
                    break;
                case "COST_ASC":
                    sort = "supportingCost ASC";
                    break;
                case "COST_DESC":
                    sort = "supportingCost DESC";
                    break;
                case "CREATED_ASC":
                    sort = "p.creation_date ASC";
                    break;
                case "CREATED_DESC":
                    sort = "p.creation_date DESC";
                    break;
            }
        }
        let where = "";
        if (q !== null || categoryIds !== null || supportingCost !== null || ownerId !== null || supporterId !== null) {
            let condition = true;
            where = `WHERE`
            if (q !== null) {
                where += ` (p.title LIKE '%${q.toLowerCase()}%' OR p.description LIKE '%${q.toLowerCase()}%')`;
                condition = false;
            }
            if (categoryIds != null) {
                if (!condition) {
                    where += ` AND`;
                } else {
                    condition = false;
                }
                where += ` p.category_id IN (${categoryIds.join(',')})`;
                condition = false;
            }
            if (supportingCost !== null) {
                if (!condition) {
                    where += ` AND`;
                } else {
                    condition = false;
                }
                where += ` st.cost <= ${supportingCost}`;
                condition = false;
            }
            if (ownerId !== null) {
                if (!condition) {
                    where += ` AND`;
                } else {
                    condition = false;
                }
                where += ` p.owner_id = ${ownerId}`;
                condition = false;
            }
            if (supporterId !== null) {
                if (!condition) {
                    where += ` AND`;
                } else {
                    condition = false;
                }
                where += ` p.id IN (SELECT petition_id FROM supporter WHERE user_id = ${supporterId})`;
                condition = false;
            }
        }


        let allPetitions = await petitions.getAll(where, sort);

        const petitionCount = allPetitions.length;
        if (req.query.startIndex !== undefined) {
            const startIndex = parseInt(req.query.startIndex as string, 10) || 0;
            allPetitions = allPetitions.slice(startIndex);
        }

        if (req.query.count !== undefined) {
            const count = parseInt(req.query.count as string, 10);
            allPetitions = allPetitions.slice(0, count);
        }

        allPetitions.forEach(petition => petition.description = undefined);
        res.status(200).send({ "petitions": allPetitions, "count": petitionCount });
        return;
    } catch (err) {
        Logger.error(`Error in getAllPetitions: ${err}`);
        res.status(500).send("Internal Server Error");
        return;
    }
}


const getPetition = async (req: Request, res: Response): Promise<void> => {
    try {
        const petitionId = parseInt(req.params.id,10)
        if (isNaN(petitionId)){
            res.status(400).send("id is not a number");
            return;
        }
        const petitionsById = await petitions.getPetitionsById(petitionId);
        if(petitionsById.length === 0){
            res.status(404).send("Id not found");
        }
        res.status(200).send(petitionsById[0]);
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const addPetition = async (req: Request, res: Response): Promise<void> => {
    try {
        const valid = await validate(schemas.petition_post, req.body);
        if (valid !== true) {
            res.status(400).send(valid.toString());
            return;
        }
        const title = req.body.title;
        const description = req.body.description;
        const categoryId = parseInt(req.body.categoryId,10);
        const supportTiers = req.body.supportTiers;
        const token = req.header('X-Authorization');
        if (token === undefined){
            res.status(401).send("you are not authorised to do this");
            return;
        }
        if (isNaN(categoryId)){
            res.status(400).send("categoryId is not a number");
            return;
        }
        if (title === undefined || description === undefined || supportTiers === undefined){
            res.status(400).send("title, description or supportTiers is missing");
            return;
        }
        if (title === ""){
            res.status(400).send("title is empty");
            return;
        }
        const user = await users.getOneByToken(token);
        const addPetitions = await petitions.postpetition(title,description,categoryId,user[0].id,new Date());
        const petitionId = addPetitions.insertId;
        for (const supportTier of supportTiers){
            await petitions.postsupportertier(supportTier.title,supportTier.description,supportTier.cost,petitionId)
        }
        const petition = await petitions.getPetitionsById(petitionId);
        res.status(201).send(petition[0]);
        return;
    } catch (err) {
        if (err.no === 1062) {
            res.status(400).send("Duplicate entry");
            return;
        }
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const editPetition = async (req: Request, res: Response): Promise<void> => {
    try {
        const valid = await validate(schemas.petition_patch, req.body);
        if (valid !== true) {
            res.status(400).send(valid.toString());
            return;
        }
        const token = req.header('X-Authorization');
        if (token === undefined)
        {
            res.status(401).send("you are not authorised to do this");
            return;
        }
        const petitionId = parseInt(req.params.id,10);
        if (isNaN(petitionId)){
            res.status(400).send("id is not a number");
            return;
        }
        const petition = await petitions.getPetitionsById(petitionId);
        if (petition.length === 0){
            res.status(404).send("id not found");
            return;
        }
        const user = await users.getOneById(petition[0].ownerId);
        if (user[0].auth_token !== token){
            res.status(403).send("you are not authorised to do this");
            return;
        }
        if (user.length === 0){
            res.status(404).send("id not found");
            return;
        }


        let description = req.body.description;
        if (description === "")
        {
        res.status(400).send("No description provided");
        return;
        }
        let categoryId = req.body.categoryId;
        let title = req.body.title;
        if(title === undefined){
            title = petition[0].title;
         }
        if (categoryId === undefined){
            categoryId = petition[0].categoryId;
        }
        if (description === undefined){
            description = petition[0].description;
        }
        const patchpetitions = await petitions.patchpetitions(title,description,categoryId,petitionId);
        res.statusMessage = "Pettition updated successfully";
        res.status(200).send();
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const deletePetition = async (req: Request, res: Response): Promise<void> => {
    try {
        // Your code goes here
        res.statusMessage = "Not Implemented Yet!";
        res.status(501).send();
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const categories = await petitions.getAllCategories();
        res.statusMessage = "Here are the categories";
        res.status(200).send(categories);
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}


export { getAllPetitions, getPetition, addPetition, editPetition, deletePetition, getCategories };