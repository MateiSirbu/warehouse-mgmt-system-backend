import { EntityManager } from "@mikro-orm/core";
import { CartItem } from "../data/cartitem.entity";
import { COLine } from "../data/coline.entity";

import { CustomerOrder, OrderStatus } from "../data/customerorder.entity";
import { User } from "../data/user.entity";
import * as cartService from "../services/cart.service"

export {
    getAllOrders,
    getOrdersByUser,
    createOrder
};

async function getAllOrders(em: EntityManager): Promise<Error | CustomerOrder[]> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");

    try {
        const orders = await em.find(CustomerOrder, {});
        return orders;
    } catch (ex) {
        throw ex;
    }
}

async function getOrdersByUser(em: EntityManager, u: User): Promise<Error | CustomerOrder[]> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");

    try {
        const user = await em.findOne(User, { id: u.id });
        const customer = user!.customer
        if (customer != null) {
            const orders = customer.orders.toArray().map(item => em.create(CustomerOrder, item));
            return orders
        }
        else
            throw Error("Not a customer");
    } catch (ex) {
        console.log(ex)
        throw ex;
    }
}

async function createOrder(em: EntityManager, u: User, a: string): Promise<Error | void> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");

    try {
        let order = new CustomerOrder({
            customer: u.customer,
            status: OrderStatus.Placed,
            address: a,
            date: new Date().getTime()
        })
        await em.persistAndFlush(order);
        let cartItems = await cartService.getCartItemsByUser(em, u)
        if (Array.isArray(cartItems)) {
            cartItems.forEach(async (cartItem) => {
                let coLine = new COLine({
                    order: order,
                    item: cartItem.item,
                    qty: cartItem.qty
                })
                await em.persistAndFlush(coLine)
            });
        }
        else {
            throw Error("Internal malfunction. Contact the system administrator")
        }

    } catch (ex) {
        console.log(ex)
        throw ex;
    }

}