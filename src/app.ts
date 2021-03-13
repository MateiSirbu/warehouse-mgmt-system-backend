import express from "express";
import data from "./data";
import { env } from "./env/env";
import { MikroORM } from "@mikro-orm/core";
import { IExpressRequest } from "./interfaces/IExpressRequest";
import { setLoginRoute } from "./routes/login.route";
import { setTestRoute } from "./routes/test.route";
import { setSignUpRoute } from "./routes/signup.route";
import * as bodyParser from "body-parser";
import { setOobeRoute } from "./routes/oobe.route";

let app: express.Application;

const init = function (): express.Application {
    app = express();

    const orm = MikroORM.init({
        entities: data,
        dbName: env.MONGO_DATABASE,
        type: "mongo"
    })

    app.use(async (req: IExpressRequest, _res: express.Response, next: express.NextFunction) => {
        req.em = (await orm).em.fork();
        next();
    });

	app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    
    app.use(env.TEST_ROUTE, setTestRoute(express.Router()));
    app.use(env.LOGIN_ROUTE, setLoginRoute(express.Router()));
    app.use(env.SIGNUP_ROUTE, setSignUpRoute(express.Router()));
    app.use(env.OOBE_ROUTE, setOobeRoute(express.Router()));

    return app;
}

export { init }