import { EntityManager, wrap } from "@mikro-orm/core";
import { COLine } from "../data/coline.entity";

import { CustomerOrder, OrderStatus } from "../data/customerorder.entity";
import { Item } from "../data/item.entity";
import { User } from "../data/user.entity";
import * as cartService from "../services/cart.service"
import * as itemService from "../services/item.service"
import * as customerOrderService from "../services/customerorder.service"

export {
    getAllOrders,
    getOrdersByUser,
    createOrder,
    getCustomerOrderById,
    editCustomerOrder,
    computeItemReservedStock,
    fillCOLine
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

async function fillCOLine(em: EntityManager, line: COLine) {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");

    try {
        const dbLine = await em.findOneOrFail(COLine, { id: line.id });
        if (line.filledQty > dbLine.qty)
            throw Error("Specified reserved quantity greater than the requested quantity");
        if (line.filledQty < 0)
            throw Error("Specified reserved quantity should be greater than or equal to zero");
        const item = await em.findOneOrFail(Item, { id: line.item.id });
        const itemReservedQty = await computeItemReservedStock(em, item.id)
        if (!(itemReservedQty instanceof Error)) {
            const itemAvblQty = item.stock - itemReservedQty
            let stockDiff = line.filledQty - dbLine.filledQty
            if (stockDiff > itemAvblQty)
                throw Error("Cannot reserve the quantity you specified, insufficient available stock");
        }
        let newDbLine = new COLine({ filledQty: line.filledQty })
        wrap(dbLine).assign(newDbLine)
        await em.persistAndFlush(dbLine)
        if (dbLine.order.status == OrderStatus.Placed) {
            let order = await customerOrderService.getCustomerOrderById(em, dbLine.order.id)
            let newOrder = new CustomerOrder({ status: OrderStatus.Processing })
            wrap(order).assign(newOrder)
            await em.persistAndFlush(order)
        }
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
        switch (status) {
            case OrderStatus.Cancelled:
                if (co.status != OrderStatus.Placed)
                    throw Error("Since this order has been processed, it cannot be cancelled");
                break;
            case OrderStatus.Closed:
                if (co.status == OrderStatus.Cancelled || co.status == OrderStatus.Placed)
                    throw Error("No stock has been reserved, cannot close order");
                const lines = co.lines.toArray().map(ln => em.create(COLine, ln));
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].filledQty != lines[i].qty)
                        throw Error("Cannot close order, the order is not fulfilled completely");
                }
                for (let i = 0; i < lines.length; i++) {
                    let item = await itemService.getItemById(em, lines[i].item.id)
                    if (item instanceof Item) {
                        let newItem = new Item({ stock: item.stock - lines[i].qty })
                        wrap(item).assign(newItem)
                        await em.persist(item)
                    }
                }
                break
        }
        let newCo = new CustomerOrder({ status: status })
        wrap(co).assign(newCo)
        await em.persistAndFlush(co)
        return co
    } catch (ex) {
        console.log(ex)
        throw ex;
    }
}

async function computeItemReservedStock(em: EntityManager, id: string): Promise<Error | number> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");

    try {
        let reservedStock = 0
        const item = await em.findOneOrFail(Item, { id: id })
        const coLines = await em.find(COLine, { item: item });
        await Promise.all(coLines.map(async (line) => {
            const order = await em.findOneOrFail(CustomerOrder, { id: line.order.id })
            if (order.status == OrderStatus.Processing)
                reservedStock += line.filledQty
        }));
        return reservedStock
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