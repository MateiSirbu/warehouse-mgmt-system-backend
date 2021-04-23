import { Router, Response, NextFunction } from "express";
import { EntityManager } from "@mikro-orm/core";
import * as crypto from "crypto-js";
import * as fs from "fs";
import { env } from "../env/env";
import expressjwt from "express-jwt";
import jwt_decode from "jwt-decode";
import { IExpressRequest } from "../interfaces/IExpressRequest";
import { Employee } from "../data/employee.entity";
import { User } from "../data/user.entity";
import { Customer } from "../data/customer.entity";
import * as employeeService from "../services/employee.service";
import * as companyService from "../services/company.service";
import * as userService from "../services/user.service";

export { setSignUpRoute };

function setSignUpRoute(router: Router): Router {
    router.post("/", jwtVerify, checkIfAdmin, signUp);
    router.post("/oobe", signUpOobe);
    return router;
}

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

async function checkIfAdmin(req: IExpressRequest, res: Response, next: NextFunction) {
    if (!req.em || !(req.em instanceof EntityManager))
        return next(Error("EntityManager not available"));

    let user: Error | User | null = null;
    let idToken = req.headers.authorization!.split(' ')[1];

    try {
        let decoded: any = jwt_decode(idToken);
        let userId = decoded.sub;
        user = await userService.getUserById(req.em, userId);
        if (user instanceof User) {
            let employee = user.employee
            let isEmployee = employee != null;
            if (!isEmployee) {
                res.statusMessage = "You do not have administrative privileges"
                return res.sendStatus(401);
            }
            else {
                if ((employee as Employee).isAdmin)
                    next();
                else {
                    res.statusMessage = "You do not have administrative privileges"
                    return res.sendStatus(401);
                }
            }
        }
    } catch {
        res.statusMessage = "You do not have administrative privileges"
        return res.sendStatus(401);
    }
    if (user instanceof Error || user === null) {
        res.statusMessage = "You do not have administrative privileges"
        return res.sendStatus(401);
    }
}

function hashPassword(password: string) {
    var salt = crypto.lib.WordArray.random(128).toString(crypto.enc.Hex);
    var hash = crypto.PBKDF2(password, salt, { keySize: 32, iterations: 10000 }).toString(crypto.enc.Hex);

    return { salt: salt, hash: hash, iterations: 10000 }
}

async function signUpCustomer(req: IExpressRequest, res: Response, next: NextFunction) {
    if (!req.em || !(req.em instanceof EntityManager))
        return next(Error("EntityManager not available"));

    let saltAndHash = hashPassword(req.body.user.hash);

    try {
        const user = new User({
            firstName: req.body.user.firstName,
            lastName: req.body.user.lastName,
            email: req.body.user.email,
            hash: saltAndHash.hash,
            salt: saltAndHash.salt
        })
        const customer = new Customer({})
        const company = await companyService.getCompanyById(req.em, req.body.metadata.id)
        if (!company || company instanceof Error)
            return res.status(400).end();
        customer.company.id = company.id
        user.customer = customer
        customer.user = user
        let newUserResponse = await userService.addUser(req.em, user);
        if (newUserResponse instanceof Error) {
            res.statusMessage = newUserResponse.message
            return res.status(400).end();
        }
        return res.status(201).json(newUserResponse);
    } catch (ex) {
        return next(ex);
    }
}

async function signUpOobe(req: IExpressRequest, res: Response, next: NextFunction) {
    if (!req.em || !(req.em instanceof EntityManager))
        return next(Error("EntityManager not available"));

    if (!await employeeService.adminExists(req.em)) {
        let saltAndHash = hashPassword(req.body.hash);

        try {
            const employee = new Employee({ isAdmin: true });
            const user = new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                hash: saltAndHash.hash,
                salt: saltAndHash.salt,
                employee: employee
            })
            let newUserResponse = await userService.addUser(req.em, user);
            if (newUserResponse instanceof Error) {
                res.statusMessage = newUserResponse.message
                return res.status(400).end();
            }
            return res.status(201).json(newUserResponse);
        } catch (ex) {
            return next(ex);
        }
    }

    res.statusMessage = "The out-of-box experience has ended"
    return res.status(401).end();
}

async function signUpEmployee(req: IExpressRequest, res: Response, next: NextFunction) {
    if (!req.em || !(req.em instanceof EntityManager))
        return next(Error("EntityManager not available"));

    let saltAndHash = hashPassword(req.body.user.hash);

    try {
        let employee: Employee;
        if (req.body.user.role == 'Administrator') {
            employee = new Employee({ isAdmin: true })
        }
        else {
            employee = new Employee({ isAdmin: false })
        }
        const user = new User({
            firstName: req.body.user.firstName,
            lastName: req.body.user.lastName,
            email: req.body.user.email,
            hash: saltAndHash.hash,
            salt: saltAndHash.salt,
            employee: employee
        })
        let newUserResponse = await userService.addUser(req.em, user);
        if (newUserResponse instanceof Error) {
            res.statusMessage = newUserResponse.message
            return res.status(400).end();
        }
        return res.status(201).json(newUserResponse);
    } catch (ex) {
        return next(ex);
    }
}

async function signUp(req: IExpressRequest, res: Response, next: NextFunction) {
    if (req.body.user.role == 'Employee' || req.body.user.role == 'Administrator')
        return signUpEmployee(req, res, next);
    else if (req.body.user.role == 'Customer')
        return signUpCustomer(req, res, next);
    else {
        res.statusMessage = 'Malformed response'
        return res.status(400).end();
    }
}