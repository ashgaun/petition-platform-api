import { Request, Response } from "express";
import Logger from '../../config/logger';
import * as users from '../models/server_model';
import * as schemas from '../resources/schemas.json';
import { validate } from '../../config/ajv';
import { randomUUID } from "node:crypto";
import { compare, hash } from "../services/passwords"


const register = async (req: Request, res: Response): Promise<void> => {
    Logger.info("Register")
    Logger.http(`POST create a user with firstName and last name: ${req.body.firstName} ${req.body.lastName}`)
    const validation = await validate(schemas.user_register, req.body);

    if (validation !== true) {
        res.statusMessage = `Bad Request: ${validation.toString()}`;
        res.status(400).send();
        return;
    }
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;
    const user = await users.getOne(email)
    if (user && user.length > 0) {
        if (email === user[0].email) {
            res.statusMessage = "invalid email, already in use";
            res.status(403).send();
            return;
        }
    }

    try {
        const result = await users.register(firstName, lastName, email, password);
        res.statusMessage = "user has been created"
        res.status(201).send({ "userId": result.insertId });
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(403).send(`ERROR creating user ${firstName} ${lastName}: ${err}`);
        return;
    }
}

const login = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`Login in with email: ${req.body.email}`)
    const validation = await validate(schemas.user_login, req.body);

    if (validation !== true) {
        res.statusMessage = `Bad Request: ${validation.toString()}`;
        res.status(400).send();
        return;
    }
    const email = req.body.email;
    const password = req.body.password;
    try {
        const user = await users.getOne(email)
        const uPassword = user[0].password
        Logger.info(user)
        const token = randomUUID()
        const result = await users.addToken(email, token);
        res.statusMessage = "user has logged in "
        if (await compare(password, uPassword) === false) {
            res.status(401).send()
        }

        if (user.length === 0) {
            res.statusMessage = `Bad Request: check your email and password}`;
            res.status(401).send("Invalid login");
            return;

        }
        res.statusMessage = "Logged in ";

        res.status(200).send({ "userId": user[0].id, "token": token });
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }

}

const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.header('X-Authorization');
        const result = await users.removeToken(token);
        if (result.affectedRows === 0) {
            res.status(401).send()
            return
        }
        res.status(200).send("User logged out ")
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;

    }
}

const view = async (req: Request, res: Response): Promise<void> => {
    Logger.http(`GET single user id: ${req.params.id}`)
    const id = parseInt(req.params.id, 10)
    try {
        if (isNaN(id)) {
            res.statusMessage = "id is not an integer"
            res.status(400).send();
            return;
        }
        const result = await users.read(id);
        if (result.length === 0) {
            res.status(404).send('User not found');
        } else {
            if (result[0].auth_token === req.header('X-Authorization')) {
                res.status(200).send({ "firstName": result[0].first_name, "lastName": result[0].last_name, "email": result[0].email });
            }
            res.status(200).send({ "firstName": result[0].first_name, "lastName": result[0].last_name });
        }

    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

const update = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.statusMessage = "Id must be an integer"
            res.status(400).send();
            return;
        }
        const user = await users.getOneById(id);
        if (user.length === 0) {
            res.status(400).send("no such user");
        }
        if (user[0].auth_token !== req.header('X-Authorization')) {
            res.send(401).send("Unauthorised");
        }
        let lastName = user[0].last_name;
        let firstName = user[0].first_name;
        let email = user[0].email;
        let newPassword = null;
        if (req.body.hasOwnProperty("password")) {
            if (req.body.hasOwnProperty("currentPassword")) {
                if (!await compare(req.body.currentPassword, user[0].password)) {
                    res.statusMessage = "Incorrect currentPassword";
                    res.status(403).send();
                    return;
                } else {
                    if (await compare(req.body.password, user[0].password)) {
                        res.statusMessage = "New password can not be the same as old password";
                        res.status(403).send();
                        return;
                    }
                    newPassword = await hash(req.body.password);
                }
            } else {
                res.statusMessage = "currentPassword must be supplied to change password";
                res.status(400).send();
                return;
            }
        }
        if (req.body.hasOwnProperty("email")) {
            email = req.body.email;
        }
        if (req.body.hasOwnProperty("firstName")) {
            firstName = req.body.firstName;
        }
        if (req.body.hasOwnProperty("lastName")) {
            lastName = req.body.lastName;
        }

        const check = {
            "id": id,
            "firstName": firstName,
            "lastName": lastName,
            "email": email,
            "password": newPassword
        }

        const validation = await validate(schemas.user_register, check);
        if (validation !== true) {
            res.status(400).send();
            return;
        }
        await users.update(firstName, lastName, email, newPassword, id);
        res.status(200).send("Updated!");
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
}

export { register, login, logout, view, update }