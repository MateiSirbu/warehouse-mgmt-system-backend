import { EntityManager, wrap } from "@mikro-orm/core";
import { Company } from "../data/company.entity";
import { Customer } from "../data/customer.entity";
import { CustomerOrder } from "../data/customerorder.entity";
import { User } from "../data/user.entity";
import { getUserById } from "./user.service";

export {
    getAllOrders,
    getOrdersByUserId
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

async function getOrdersByUserId(em: EntityManager, id: string): Promise<Error | CustomerOrder[]> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");
    if (!id || typeof id !== "string")
        throw Error("Malformed input");

    try {
        const user = await em.findOne(User, { id: id });
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

async function updateCustomer(em: EntityManager, customer: Partial<Customer>, email: string): Promise<Error | Customer> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");
    if (!customer || !customer.user || typeof customer !== "object" || typeof customer.user !== "object" || !customer.user?.email || email !== customer.user.email)
        throw Error("Malformed input");

    try {
        const user = await em.findOne(User, { email: email });
        const editedCustomer = user!.customer;
        wrap(editedCustomer).assign(customer);
        await em.persistAndFlush(editedCustomer);
        return editedCustomer;
    } catch (ex) {
        console.log(ex)
        throw ex;
    }
}

async function addCustomer(em: EntityManager, customer: Partial<Customer>, email: string): Promise<Error | Customer> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");
    if (!customer || typeof customer !== "object")
        throw Error("Malformed input");
    if (await getUserById(em, email) != null)
        throw Error("E-mail address already associated with an account")

    try {
        const item = new Customer(customer);
        await em.persistAndFlush(item);
        return item;
    } catch (ex) {
        console.log(ex)
        throw ex;
    }
}