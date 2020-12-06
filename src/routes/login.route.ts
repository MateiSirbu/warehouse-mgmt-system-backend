import { Router, Response, NextFunction } from "express";
import * as fs from "fs";
import * as jwt from "jsonwebtoken";
import expressjwt from "express-jwt";
import jwt_decode from "jwt-decode";
import * as crypto from "crypto-js";
import { EntityManager } from "@mikro-orm/core";
import * as userService from "../services/user.service";
import { User } from "../data/user.entity";
import { env } from "../env/env";
import { IExpressRequest } from "../interfaces/IExpressRequest";

export { setLoginRoute };

function setLoginRoute(router: Router): Router {
    router.post("/", login);
    router.post("/userinfo", jwtVerify, getUserInfoFromToken);
    return router;
}

function validateCredentials(user: User, password: string) {
    return user.hash == crypto.PBKDF2(password, user.salt, { keySize: 32, iterations: 10000 }).toString(crypto.enc.Hex);
}

async function login(req: IExpressRequest, res: Response, next: NextFunction) {
    if (!req.em || !(req.em instanceof EntityManager))
        return next(Error("EntityManager not available"));

    let user: Error | User | null;
    try {
        user = await userService.getUserByEmail(req.em, req.body.email);
    } catch (ex) {
        return next(ex);
    }

    if (user instanceof Error) return next(user);

    if (user === null)
        res.sendStatus(404);
    else {
        const privateKey = fs.readFileSync(env.JWT_PRIVATE_KEY);
        if (validateCredentials(user, req.body.password)) {
            const jwtToken = jwt.sign({}, privateKey, { algorithm: 'RS256', expiresIn: 86400, subject: user.id })
            res.status(200).json({ idToken: jwtToken, expiresIn: 86400 })
        }
        else {
            res.sendStatus(401);
        }
    }
}

const jwtVerify = expressjwt({
    secret: fs.readFileSync(env.JWT_PUBLIC_KEY),
    algorithms: ['RS256'],
    getToken: function fromReqBody(req) {
        return req.body.idToken;
    }
})

async function getUserInfoFromToken(req: IExpressRequest, res: Response, next: NextFunction) {
    if (!req.em || !(req.em instanceof EntityManager))
        return next(Error("EntityManager not available"));

    let user: Error | User | null = null;
    let idToken = req.body.idToken;

    let decoded: any = jwt_decode(idToken);
    let userId = decoded.sub;

    try {
        user = await userService.getUserById(req.em, userId);
    } catch (ex) {
        return next(ex);
    }

    if (user instanceof Error || user === null) 
        return res.sendStatus(401);

    return res.json({ id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email });
}