import { EntityManager, wrap } from "@mikro-orm/core";
import { COLine } from "../data/coline.entity";

import { CustomerOrder, OrderStatus } from "../data/customerorder.entity";
import { User } from "../data/user.entity";
import * as cartService from "../services/cart.service"

export {
    getAllOrders,
    getOrdersByUser,
    createOrder,
    getCustomerOrderById,
    editCustomerOrder
};

async function getAllOrders(em: EntityManager): Promise<Error | CustomerOrder[]> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");

    try {
        const orders = await em.find(CustomerOrder, {}, ['customer', 'customer.user']);
        orders.sort((a, b) => (a.date > b.date) ? -1 : ((b.date > a.date) ? 1 : 0))
        return Promise.all(orders.map(async co => {
            let user = await em.findOneOrFail(User, { customer: co.customer })
            co.customer.user = user
            return co
        }));
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
            orders.sort((a, b) => (a.date > b.date) ? -1 : ((b.date > a.date) ? 1 : 0))
            return orders
        }
        else
            throw Error("Not a customer");
    } catch (ex) {
        console.log(ex)
        throw ex;
    }
}

async function getCustomerOrderById(em: EntityManager, id: string): Promise<Error | CustomerOrder> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");

    try {
        const co = await em.findOneOrFail(CustomerOrder, { id: id }, ['lines', 'lines.item']);
        return co
    } catch (ex) {
        console.log(ex)
        throw ex;
    }
}

async function editCustomerOrder(em: EntityManager, id: string, status: OrderStatus): Promise<Error | CustomerOrder> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");

    try {
        const co = await em.findOneOrFail(CustomerOrder, { id: id }, ['lines', 'lines.item']);
        let newCo = new CustomerOrder({ status: status })
        wrap(co).assign(newCo)
        await em.persistAndFlush(co)
        return co
    } catch (ex) {
        console.log(ex)
        throw ex;
    }
}

async function createOrder(em: EntityManager, u: User, a: string): Promise<Error | void> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");

    try {
        let cartItems = await cartService.getCartItemsByUser(em, u)
        if (Array.isArray(cartItems)) {
            let order = new CustomerOrder({
                customer: u.customer,
                status: OrderStatus.Placed,
                address: a,
                date: new Date().getTime()
            })
            await Promise.all(cartItems.map(async (cartItem) => {
                let coLine = new COLine({
                    order: order,
                    item: cartItem.item,
                    qty: cartItem.qty,
                    filledQty: 0
                })
                order.lines.add(coLine)
            }));
            return em.persistAndFlush(order);
        }
        else {
            throw Error("Internal malfunction. Contact the system administrator")
        }
    } catch (ex) {
        console.log(ex)
        throw ex;
    }
}