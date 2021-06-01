import { EntityManager, wrap } from "@mikro-orm/core";
import { Employee } from "../data/employee.entity";
import { User } from "../data/user.entity";
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
        throw Error("Invalid request");

    try {
        const employees = await em.find(Employee, {});
        return employees;
    } catch (ex) {
        console.log(ex)
        throw ex;
    }
}

async function getEmployeeByUserId(em: EntityManager, id: string): Promise<Error | Employee | null> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");
    if (!id || typeof id !== "string")
        throw Error("Invalid params");

    try {
        const user = await em.findOne(User, { id: id });
        const employee = user!.employee
        return employee;
    } catch (ex) {
        console.log(ex)
        throw ex;
    }
}

async function getEmployeeById(em: EntityManager, id: string): Promise<Error | Employee | null> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");
    if (!id || typeof id !== "string")
        throw Error("Invalid params");

    try {
        const employee = await em.findOne(Employee, { id: id });
        return employee;
    } catch (ex) {
        console.log(ex)
        throw ex;
    }
}

async function getEmployeeByEmail(em: EntityManager, email: string): Promise<Error | Employee | null> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");
    if (!email || typeof email !== "string")
        throw Error("Invalid params");

    try {
        const user = await em.findOne(User, { email: email });
        const employee = user!.employee
        return employee;
    } catch (ex) {
        console.log(ex)
        throw ex;
    }
}

async function removeEmployee(em: EntityManager, email: string): Promise<Error | void> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");
    if (!email || typeof email !== "string")
        throw Error("Invalid params");

    try {
        const user = await em.findOne(User, { email: email });
        const employee = user!.employee
        await em.removeAndFlush(employee);
    } catch (ex) {
        console.log(ex)
        throw ex;
    }
}

async function updateEmployee(em: EntityManager, employee: Partial<Employee>, email: string): Promise<Error | Employee> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");
    if (!employee || !employee.user || typeof employee !== "object" || typeof employee.user !== "object" || !employee.user?.email || email !== employee.user.email)
        throw Error("Invalid params");

    try {
        const user = await em.findOne(User, { email: email });
        const editedEmployee = user!.employee
        wrap(editedEmployee).assign(employee);
        await em.persistAndFlush(editedEmployee);
        return editedEmployee;
    } catch (ex) {
        console.log(ex)
        throw ex;
    }
}

async function adminExists(em: EntityManager) {
    let result = await em.findOne(Employee, { isAdmin: true });
    return result;
}

async function addEmployee(em: EntityManager, employee: Partial<Employee>, email: string): Promise<Error | Employee> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");
    if (!employee || typeof employee !== "object")
        throw Error("Invalid params");
    if (await getUserById(em, email) != null)
        throw Error("E-mail address already associated with an account")

    try {
        const item = new Employee(employee);
        await em.persistAndFlush(item);
        return item;
    } catch (ex) {
        console.log(ex)
        throw ex;
    }
}