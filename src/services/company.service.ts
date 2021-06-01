import { EntityManager, wrap } from "@mikro-orm/core";
import { Company } from "../data/company.entity";

export { addCompany, editCompany, getCompanyById, getCompanyByName, getAllCompanies };

async function getAllCompanies(em: EntityManager): Promise<Error | Company[]> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");

    try {
        const companies = em.find(Company, {});
        return companies;
    } catch (ex) {
        throw ex;
    }
}

async function getCompanyById(em: EntityManager, id: string): Promise<Error | Company | null> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");
    if (!id || typeof id !== "string")
        throw Error("Malformed input");

    try {
        const company = em.findOne(Company, { id: id });
        return company;
    } catch (ex) {
        throw ex;
    }
}

async function getCompanyByName(em: EntityManager, name: string): Promise<Error | Company | null> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");
    if (!name || typeof name !== "string")
        throw Error("Malformed input");

    try {
        const company = await em.findOne(Company, { name: name }, { populate: true });
        return company;
    } catch (ex) {
        throw ex;
    }
}

async function addCompany(em: EntityManager, company: Partial<Company>): Promise<Error | Company> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");
    if (!company || typeof company !== "object")
        throw Error("Malformed input");
    if (!company.name || company.name == "" || typeof company.name !== "string")
        throw Error("Company name cannot be null")
    if (!company.address || company.address == "" || typeof company.address !== "string")
        throw Error("Address cannot be null")
    if (await getCompanyByName(em, company.name!) != null)
        throw Error("Company already exists")

    try {
        const item = new Company(company);
        await em.persistAndFlush(item);
        return item;
    } catch (ex) {
        throw ex;
    }
}

async function editCompany(em: EntityManager, company: Partial<Company>): Promise<Error | Company> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");
    if (!company || typeof company !== "object")
        throw Error("Malformed input");
    if (!company.name || company.name == "" || typeof company.name !== "string")
        throw Error("Company name cannot be null")
    if (!company.address || company.address == "" || typeof company.address !== "string")
        throw Error("Address cannot be null")

    try {
        console.log(company)
        const item = await em.findOneOrFail(Company, { id: company.id });
        wrap(item).assign(company)
        await em.persistAndFlush(item)
        return item
    } catch (ex) {
        return ex;
    }
}

