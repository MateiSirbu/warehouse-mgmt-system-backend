import { EntityManager, wrap } from "@mikro-orm/core";
import { Employee } from "../data/employee.entity";
import { getUserById } from "./user.service";

export {
    getAllEmployees,
    getEmployeeById,
    getEmployeeByEmail,
    getEmployeeByUserId,
    updateEmployee,
    addEmployee,
    removeEmployee,
    adminExists
};

async function getAllEmployees(em: EntityManager): Promise<Error | Employee[]> {
    if (!(em instanceof EntityManager))
        return Error("Invalid request");

    try {
        const employees = em.find(Employee, {});
        return employees;
    } catch (ex) {
        return ex;
    }
}

async function getEmployeeByUserId(em: EntityManager, id: string): Promise<Error | Employee | null> {
    if (!(em instanceof EntityManager))
        return Error("Invalid request");
    if (!id || typeof id !== "string")
        return Error("Invalid params");

    try {
        const employee = em.findOne(Employee, { user: id });
        return employee;
    } catch (ex) {
        return ex;
    }
}

async function getEmployeeById(em: EntityManager, id: string): Promise<Error | Employee | null> {
    if (!(em instanceof EntityManager))
        return Error("Invalid request");
    if (!id || typeof id !== "string")
        return Error("Invalid params");

    try {
        const employee = em.findOne(Employee, { id: id });
        return employee;
    } catch (ex) {
        return ex;
    }
}

async function getEmployeeByEmail(em: EntityManager, email: string): Promise<Error | Employee | null> {
    if (!(em instanceof EntityManager))
        return Error("Invalid request");
    if (!email || typeof email !== "string")
        return Error("Invalid params");

    try {
        const employee = em.findOne(Employee, { user: {email: email} });
        return employee;
    } catch (ex) {
        return ex;
    }
}

async function removeEmployee(em: EntityManager, email: string): Promise<Error | void> {
    if (!(em instanceof EntityManager))
        return Error("Invalid request");
    if (!email || typeof email !== "string")
        return Error("Invalid params");

    try {
        const employee = await em.findOneOrFail(Employee, { user: {email: email} });
        await em.removeAndFlush(employee);
    } catch (ex) {
        return ex;
    }
}

async function updateEmployee(em: EntityManager, employee: Partial<Employee>, email: string): Promise<Error | Employee> {
    if (!(em instanceof EntityManager))
        return Error("Invalid request");
    if (!employee || !employee.user || typeof employee !== "object" || typeof employee.user !== "object" || !employee.user?.email || email !== employee.user.email)
        return Error("Invalid params");

    try {
        const editedEmployee = await em.findOneOrFail(Employee, { user: {email: employee.user.email} });
        wrap(editedEmployee).assign(employee);
        await em.persistAndFlush(editedEmployee);
        return editedEmployee;
    } catch (ex) {
        return ex;
    }
}

async function adminExists(em: EntityManager) {
    let result = await em.findOne(Employee, { isAdmin: true });
    return result;
}

async function addEmployee(em: EntityManager, employee: Partial<Employee>, email: string): Promise<Error | Employee> {
    if (!(em instanceof EntityManager))
        return Error("Invalid request");
    if (!employee || typeof employee !== "object")
        return Error("Invalid params");
    if (await getUserById(em, email) != null)
        return Error("E-mail address already associated with an account")

    try {
        const item = new Employee(employee);
        await em.persistAndFlush(item);
        return item;
    } catch (ex) {
        return ex;
    }
}