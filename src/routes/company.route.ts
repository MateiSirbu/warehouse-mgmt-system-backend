import { Router, Response, NextFunction } from "express";
import * as fs from "fs";
import expressjwt from "express-jwt";
import { env } from "../env/env";
import { IExpressRequest } from "../interfaces/IExpressRequest";
import { User } from "../data/user.entity";
import * as employeeService from "../services/employee.service";
import * as userService from "../services/user.service";
import * as companyService from "../services/company.service";
import { EntityManager, IdentifiedReference, Reference } from "@mikro-orm/core";
import jwt_decode from "jwt-decode";
import { Employee } from "../data/employee.entity";

export { setCompanyRoute };

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

function setCompanyRoute(router: Router): Router {
    router.post("/", jwtVerify, checkIfAdmin, addCompany);
    router.put("/", jwtVerify, checkIfAdmin, editCompany);
    router.get("/", jwtVerify, checkIfAdmin, getCompanies);
    return router;
}

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
            let employee = user.employee;
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

async function addCompany(req: IExpressRequest, res: Response, next: NextFunction) {
    if (!req.em || !(req.em instanceof EntityManager))
        return next(Error("EntityManager not available"));
    try {
        await companyService.addCompany(req.em, req.body)
        return res.status(200).end();
    } catch {
        res.statusMessage = "Cannot add company."
        return res.sendStatus(500);
    }
}

async function editCompany(req: IExpressRequest, res: Response, next: NextFunction) {
    if (!req.em || !(req.em instanceof EntityManager))
        return next(Error("EntityManager not available"));
    try {
        await companyService.editCompany(req.em, req.body)
        return res.status(200).end();
    } catch {
        res.statusMessage = "Cannot edit company."
        return res.sendStatus(500);
    }
}

async function getCompanies(req: IExpressRequest, res: Response, next: NextFunction) {
    if (!req.em || !(req.em instanceof EntityManager))
        return next(Error("EntityManager not available"));

    try {
        const companies = await companyService.getAllCompanies(req.em)
        return res.status(200).json(companies)
    } catch {
        res.statusMessage = "Cannot fetch companies"
        return res.sendStatus(500);
    }
}