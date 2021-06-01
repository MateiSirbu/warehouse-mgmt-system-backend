import { EntityManager, wrap } from "@mikro-orm/core";
import { Company } from "../data/company.entity";
import { Customer } from "../data/customer.entity";
import { User } from "../data/user.entity";
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
        throw Error("Invalid request");

    try {
        const customers = await em.find(Customer, {});
        return customers;
    } catch (ex) {
        throw ex;
    }
}

async function getCustomerByUserId(em: EntityManager, id: string): Promise<Error | Customer | null> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");
    if (!id || typeof id !== "string")
        throw Error("Malformed input");

    try {
        const user = await em.findOne(User, { id: id });
        const customer = user!.customer
        if (customer != null) {
            const company = await em.findOneOrFail(Company, { id: customer.company.id })
            customer.company = company
        }
        return customer;
    } catch (ex) {
        console.log(ex)
        throw ex;
    }
}

async function getCustomerById(em: EntityManager, id: string): Promise<Error | Customer | null> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");
    if (!id || typeof id !== "string")
        throw Error("Malformed input");

    try {
        const customer = await em.findOneOrFail(Customer, { id: id });
        const company = await em.findOneOrFail(Company, { id: customer.company.id })
        customer.company = company
        return customer;
    } catch (ex) {
        console.log(ex)
        throw ex;
    }
}

async function getCustomerByEmail(em: EntityManager, email: string): Promise<Error | Customer | null> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");
    if (!email || typeof email !== "string")
        throw Error("Malformed input");

    try {
        const user = await em.findOne(User, { email: email });
        const customer = user!.customer
        if (customer != null) {
            const company = await em.findOneOrFail(Company, { id: customer.company.id })
            customer.company = company
        }
        return customer;
    } catch (ex) {
        console.log(ex)
        throw ex;
    }
}

async function removeCustomer(em: EntityManager, email: string): Promise<Error | void> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");
    if (!email || typeof email !== "string")
        throw Error("Malformed input");

    try {
        const user = await em.findOne(User, { email: email });
        const customer = user!.customer
        await em.removeAndFlush(customer);
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