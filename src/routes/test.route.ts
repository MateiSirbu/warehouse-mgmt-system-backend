import { Router, Response, NextFunction } from "express";
import { EntityManager } from "@mikro-orm/core";
import { IExpressRequest } from "../interfaces/IExpressRequest";

export { setTestRoute };

function setTestRoute(router: Router): Router {
	router.get("/", getTest);
	return router;
}

async function getTest(req: IExpressRequest, res: Response, next: NextFunction) {
	if (!req.em || !(req.em instanceof EntityManager))
		return next(Error("EntityManager not available"));

	let test: Error | String | null;
	try {
		test = "test"
	} catch (ex) {
		return next(ex);
	}

	if (test instanceof Error)
		return next(test);

	if (test === null)
		return res.status(404).end();

	return res.json(test);
}