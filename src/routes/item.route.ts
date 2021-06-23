import { Router, Response, NextFunction } from "express";
import * as fs from "fs";
import expressjwt from "express-jwt";
import { env } from "../env/env";
import { IExpressRequest } from "../interfaces/IExpressRequest";
import { User } from "../data/user.entity";
import * as userService from "../services/user.service";
import * as itemService from "../services/item.service";
import { EntityManager } from "@mikro-orm/core";
import jwt_decode from "jwt-decode";

export { setItemRoute };

const jwtVerify = expressjwt({
    secret: fs.readFileSync(env.JWT_PUBLIC_KEY),
    algorithms: ['RS256'],
    getToken: function fromHeader(req) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            return req.headers.authorization.split(' ')[1];
        }
        return null;
    }
});

function setItemRoute(router: Router): Router {
    router.post("/", jwtVerify, checkIfEmployee, addItem);
    router.put("/", jwtVerify, checkIfEmployee, editItem);
    router.get("/", jwtVerify, getItems);
    return router;
}

async function checkIfEmployee(req: IExpressRequest, res: Response, next: NextFunction) {
    if (!req.em || !(req.em instanceof EntityManager))
        return next(Error("EntityManager not available"));

    let user: Error | User | null = null;
    let idToken = req.headers.authorization!.split(' ')[1];

    try {
        let decoded: any = jwt_decode(idToken);
        let userId = decoded.sub;
        user = await userService.getUserById(req.em, userId);
        if (user instanceof User) {
            let employee = user.employee;
            let isEmployee = employee != null;
            if (!isEmployee) {
                res.statusMessage = "You are not logged in as an employee"
                return res.sendStatus(401);
            }
            else {
                return next();
            }
        }
    } catch {
        res.statusMessage = "You are not logged in as an employee"
        return res.sendStatus(401);
    }
    if (user instanceof Error || user === null) {
        res.statusMessage = "You are not logged in as an employee"
        return res.sendStatus(401);
    }
}

async function addItem(req: IExpressRequest, res: Response, next: NextFunction) {
    if (!req.em || !(req.em instanceof EntityManager))
        return next(Error("EntityManager not available"));
    try {
        await itemService.addItem(req.em, req.body)
        return res.status(200).end();
    } catch (ex) {
        res.statusMessage = ex.message;
        return res.sendStatus(500);
    }
}

async function editItem(req: IExpressRequest, res: Response, next: NextFunction) {
    if (!req.em || !(req.em instanceof EntityManager))
        return next(Error("EntityManager not available"));
    try {
        await itemService.updateItem(req.em, req.body)
        return res.status(200).end();
    } catch (ex) {
        res.statusMessage = ex.message;
        return res.sendStatus(500);
    }
}

async function getItems(req: IExpressRequest, res: Response, next: NextFunction) {
    if (!req.em || !(req.em instanceof EntityManager))
        return next(Error("EntityManager not available"));

    try {
        const items = await itemService.getAllItems(req.em)
        return res.status(200).json(items)
    } catch (ex) {
        res.statusMessage = ex.message;
        return res.sendStatus(500);
    }
}