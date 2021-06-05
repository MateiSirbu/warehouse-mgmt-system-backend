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

export { setOrderRoute };

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

function setOrderRoute(router: Router): Router {
    router.post("/", jwtVerify, placeOrder);
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
                return false;
            }
            else {
                return true;
            }
        }
    } catch (ex) {
        throw ex
    }
    if (user instanceof Error) {
        throw user
    }
}

async function placeOrder(req: IExpressRequest, res: Response, next: NextFunction) {
    if (!req.em || !(req.em instanceof EntityManager))
        return next(Error("EntityManager not available"));
    try {
        let isEmployee = checkIfEmployee(req, res, next)
        if (isEmployee) {
            await placeEmployeeOrder(req, res, next)
        }
        else {
            await placeCustomerOrder(req, res, next)
        }
    } catch (ex) {
        res.statusMessage = ex.message;
        return res.sendStatus(500);
    }
}

async function placeEmployeeOrder(req: IExpressRequest, res: Response, next: NextFunction) {
    if (!req.em || !(req.em instanceof EntityManager))
        return next(Error("EntityManager not available"));

    try {
        
        return res.status(200).json("EMPLOYEE ORDER NOT IMPLEMENTED YET")
    } catch (ex) {
        res.statusMessage = ex.message;
        return res.sendStatus(500);
    }
}

async function placeCustomerOrder(req: IExpressRequest, res: Response, next: NextFunction) {
    if (!req.em || !(req.em instanceof EntityManager))
        return next(Error("EntityManager not available"));

    try {

        return res.status(200).json()
    } catch (ex) {
        res.statusMessage = ex.message;
        return res.sendStatus(500);
    }
}