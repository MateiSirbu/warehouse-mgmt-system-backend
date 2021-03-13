import { EntityManager, wrap } from "@mikro-orm/core";
import { Customer } from "../data/customer.entity";
import { getUserById } from "./user.service";

export {
    getAllCustomers,
    getCustomerById,
    getCustomerByEmail,
    getCustomerByUserId,
    updateCustomer,
    addCustomer,
    removeCustomer
};

async function getAllCustomers(em: EntityManager): Promise<Error | Customer[]> {
    if (!(em instanceof EntityManager))
        return Error("Invalid request");

    try {
        const customers = em.find(Customer, {});
        return customers;
    } catch (ex) {
        return ex;
    }
}

async function getCustomerByUserId(em: EntityManager, id: string): Promise<Error | Customer | null> {
    if (!(em instanceof EntityManager))
        return Error("Invalid request");
    if (!id || typeof id !== "string")
        return Error("Invalid params");

    try {
        const customer = em.findOne(Customer, { user: id });
        return customer;
    } catch (ex) {
        return ex;
    }
}

async function getCustomerById(em: EntityManager, id: string): Promise<Error | Customer | null> {
    if (!(em instanceof EntityManager))
        return Error("Invalid request");
    if (!id || typeof id !== "string")
        return Error("Invalid params");

    try {
        const customer = em.findOne(Customer, { id: id });
        return customer;
    } catch (ex) {
        return ex;
    }
}

async function getCustomerByEmail(em: EntityManager, email: string): Promise<Error | Customer | null> {
    if (!(em instanceof EntityManager))
        return Error("Invalid request");
    if (!email || typeof email !== "string")
        return Error("Invalid params");

    try {
        const customer = em.findOne(Customer, { user: {email: email} });
        return customer;
    } catch (ex) {
        return ex;
    }
}

async function removeCustomer(em: EntityManager, email: string): Promise<Error | void> {
    if (!(em instanceof EntityManager))
        return Error("Invalid request");
    if (!email || typeof email !== "string")
        return Error("Invalid params");

    try {
        const customer = await em.findOneOrFail(Customer, { user: {email: email} });
        await em.removeAndFlush(customer);
    } catch (ex) {
        return ex;
    }
}

async function updateCustomer(em: EntityManager, customer: Partial<Customer>, email: string): Promise<Error | Customer> {
    if (!(em instanceof EntityManager))
        return Error("Invalid request");
    if (!customer || !customer.user || typeof customer !== "object" || typeof customer.user !== "object" || !customer.user?.email || email !== customer.user.email)
        return Error("Invalid params");

    try {
        const editedCustomer = await em.findOneOrFail(Customer, { user: {email: customer.user.email} });
        wrap(editedCustomer).assign(customer);
        await em.persistAndFlush(editedCustomer);
        return editedCustomer;
    } catch (ex) {
        return ex;
    }
}

async function addCustomer(em: EntityManager, customer: Partial<Customer>, email: string): Promise<Error | Customer> {
    if (!(em instanceof EntityManager))
        return Error("Invalid request");
    if (!customer || typeof customer !== "object")
        return Error("Invalid params");
        if (await getUserById(em, email) != null)
        return Error("E-mail address already associated with an account")

    try {
        const item = new Customer(customer);
        await em.persistAndFlush(item);
        return item;
    } catch (ex) {
        return ex;
    }
}