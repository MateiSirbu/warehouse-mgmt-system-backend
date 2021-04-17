import { Router, Response, NextFunction } from "express";
import * as fs from "fs";
import * as jwt from "jsonwebtoken";
import expressjwt from "express-jwt";
import jwt_decode from "jwt-decode";
import * as crypto from "crypto-js";
import { EntityManager, Reference } from "@mikro-orm/core";
import * as userService from "../services/user.service";
import * as customerService from "../services/customer.service";
import * as employeeService from "../services/employee.service";
import { User } from "../data/user.entity";
import { env } from "../env/env";
import { IExpressRequest } from "../interfaces/IExpressRequest";
import { Employee } from "../data/employee.entity";

export { setLoginRoute, getUserInfoFromToken };

const jwtVerify = expressjwt({
    secret: fs.readFileSync(env.JWT_PUBLIC_KEY),
    algorithms: ['RS256'],
    getToken: function fromHeader(req) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            return req.headers.authorization.split(' ')[1];
        }
        return null;
    }
})

function setLoginRoute(router: Router): Router {
    router.post("/", login);
    router.get("/userinfo", jwtVerify, getUserInfoFromToken);
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
        if (user === null) {
            return res.sendStatus(404);
        }
        if (user instanceof User) {
            let isAdmin = false;
            let isEmployee = user.employee != null;
            let isCustomer = user.customer != null;
            if (isEmployee) {
                isAdmin = user.employee.isAdmin!
            }
            const privateKey = fs.readFileSync(env.JWT_PRIVATE_KEY);
            if (validateCredentials(user, req.body.password)) {
                const jwtToken = jwt.sign({}, privateKey, { algorithm: 'RS256', expiresIn: 86400, subject: user.id })
                return res.status(200).json({ idToken: jwtToken, expiresIn: 86400, isEmployee: isEmployee, isCustomer: isCustomer, isAdmin: isAdmin })
            }
            else {
                res.statusMessage = ""
                return res.sendStatus(401).end()
            }
        }
        if (user instanceof Error)
            return next(user);
        else
            return res.sendStatus(401).end()
    } catch (ex) {
        return next(ex);
    }
}

async function getUserInfoFromToken(req: IExpressRequest, res: Response, next: NextFunction) {
    if (!req.em || !(req.em instanceof EntityManager))
        return next(Error("EntityManager not available"));

    let user: Error | User | null = null;
    let idToken = req.headers.authorization!.split(' ')[1];

    try {
        let decoded: any = jwt_decode(idToken);
        let userId = decoded.sub;
        user = await userService.getUserById(req.em, userId);
        if (user instanceof User) {
            let employee = await employeeService.getEmployeeByUserId(req.em, user.id);
            let customer = await customerService.getCustomerByUserId(req.em, user.id);
            let isAdmin = false;
            let isEmployee = employee != null;
            let isCustomer = customer != null;
            if (isEmployee && (employee as Employee).isAdmin)
                isAdmin = true;
            return res.json({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isEmployee: isEmployee,
                isCustomer: isCustomer,
                isAdmin: isAdmin
            });
        }
    } catch {
        return res.sendStatus(401)
    }

    if (user instanceof Error || user === null)
        return res.sendStatus(401);
}