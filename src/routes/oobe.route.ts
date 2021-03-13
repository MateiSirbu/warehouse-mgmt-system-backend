import { Router, Response, NextFunction } from "express";
import { EntityManager } from "@mikro-orm/core";
import * as employeeService from "../services/employee.service";
import { IExpressRequest } from "../interfaces/IExpressRequest";

export { setOobeRoute };

function setOobeRoute(router: Router): Router {
    router.get("/", checkIfOobe);
    return router;
}

async function checkIfOobe(req: IExpressRequest, res: Response, next: NextFunction) {
    if (!req.em || !(req.em instanceof EntityManager))
        return next(Error("EntityManager not available"));

    if (await employeeService.adminExists(req.em))
        return res.status(200).send({isOobe: false});
    
    return res.status(200).send({isOobe: true});
}