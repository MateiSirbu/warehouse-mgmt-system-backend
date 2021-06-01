import { Router, Response, NextFunction } from "express";
import * as fs from "fs";
import expressjwt from "express-jwt";
import { env } from "../env/env";
import { IExpressRequest } from "../interfaces/IExpressRequest";
import { User } from "../data/user.entity";
import * as userService from "../services/user.service";
import * as cartItemService from "../services/cartitem.service";
import { EntityManager } from "@mikro-orm/core";
import jwt_decode from "jwt-decode";
import { CartItem } from "../data/cartitem.entity";

export { setCartItemRoute };

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

function setCartItemRoute(router: Router): Router {
    router.post("/", jwtVerify, addCartItem);
    router.put("/", jwtVerify, editCartItem);
    router.get("/", jwtVerify, getCartItems);
    router.delete("/", jwtVerify, clearCart);
    router.delete("/:id", jwtVerify, deleteCartItem);
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



async function addCartItem(req: IExpressRequest, res: Response, next: NextFunction) {
    if (!req.em || !(req.em instanceof EntityManager))
        return next(Error("EntityManager not available"));

    let user: Error | User | null = null;
    let idToken = req.headers.authorization!.split(' ')[1];

    try {
        let decoded: any = jwt_decode(idToken);
        let userId = decoded.sub;
        user = await userService.getUserById(req.em, userId);
        if (user instanceof User) {
            await cartItemService.addCartItem(req.em, req.body, user)
            return res.status(200).end();
        } else {
            res.statusMessage = "You are not logged in"
            return res.sendStatus(401)
        }
    } catch (ex) {
        res.statusMessage = ex.message;
        return res.sendStatus(500);
    }
}

async function clearCart(req: IExpressRequest, res: Response, next: NextFunction) {
    if (!req.em || !(req.em instanceof EntityManager))
        return next(Error("EntityManager not available"));

    let user: Error | User | null = null;
    let idToken = req.headers.authorization!.split(' ')[1];

    try {
        let decoded: any = jwt_decode(idToken);
        let userId = decoded.sub;
        user = await userService.getUserById(req.em, userId);
        if (user instanceof User) {
            await cartItemService.clearCart(req.em, user)
            return res.status(200).end();
        } else {
            res.statusMessage = "You are not logged in"
            return res.sendStatus(401)
        }
    } catch (ex) {
        res.statusMessage = ex.message;
        return res.sendStatus(500);
    }
}

async function deleteCartItem(req: IExpressRequest, res: Response, next: NextFunction) {
    if (!req.em || !(req.em instanceof EntityManager))
        return next(Error("EntityManager not available"));

    let user: Error | User | null = null;
    let idToken = req.headers.authorization!.split(' ')[1];

    try {
        let decoded: any = jwt_decode(idToken);
        let userId = decoded.sub;
        user = await userService.getUserById(req.em, userId);
        if (user instanceof User) {
            let cartItem = await cartItemService.getCartItem(req.em, req.params.id)
            if (cartItem instanceof CartItem) {
                if (userId == cartItem.user.id) {
                    console.log(req.params.id)
                    await cartItemService.deleteCartItem(req.em, req.params.id)
                    return res.status(200).end();
                }
                else {
                    res.statusMessage = "You are not authorized to delete this item"
                    return res.sendStatus(401)
                }
            }
        } else {
            res.statusMessage = "You are not logged in"
            return res.sendStatus(401)
        }
    } catch (ex) {
        res.statusMessage = ex.message;
        return res.sendStatus(500);
    }
}

async function editCartItem(req: IExpressRequest, res: Response, next: NextFunction) {
    if (!req.em || !(req.em instanceof EntityManager))
        return next(Error("EntityManager not available"));
    try {
        await cartItemService.updateCartItem(req.em, req.body)
        return res.status(200).end();
    } catch (ex) {
        res.statusMessage = ex.message;
        return res.sendStatus(500);
    }
}

async function getCartItems(req: IExpressRequest, res: Response, next: NextFunction) {
    if (!req.em || !(req.em instanceof EntityManager))
        return next(Error("EntityManager not available"));

    let user: Error | User | null = null;
    let idToken = req.headers.authorization!.split(' ')[1];

    try {
        let decoded: any = jwt_decode(idToken);
        let userId = decoded.sub;
        user = await userService.getUserById(req.em, userId);
        if (user instanceof User) {
            let result = await cartItemService.getCartItemsByUser(req.em, user)
            return res.status(200).json(result);
        } else {
            res.statusMessage = "You are not logged in"
            return res.sendStatus(401)
        }
    } catch (ex) {
        res.statusMessage = ex.message;
        return res.sendStatus(500);
    }
}