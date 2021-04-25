import { User } from "../data/user.entity";
import { EntityManager, wrap } from "@mikro-orm/core";

export {
    getAllUsers,
    getUserById,
    getUserByEmail,
    updateUser,
    addUser,
    removeUser
};

async function getAllUsers(em: EntityManager): Promise<Error | User[]> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");

    try {
        const users = em.find(User, {});
        return users;
    } catch (ex) {
        return ex;
    }
}

async function getUserById(em: EntityManager, id: string): Promise<Error | User | null> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");
    if (!id || typeof id !== "string")
        throw Error("Invalid params");
    try {
        const user = em.findOne(User, { id: id });
        return user;
    } catch (ex) {
        return ex;
    }
}

async function getUserByEmail(em: EntityManager, email: string): Promise<Error | User | null> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");
    if (!email || typeof email !== "string")
        throw Error("Invalid params");

    try {
        const user = await em.findOne(User, { email: email }, { populate: true });
        return user;
    } catch (ex) {
        return ex;
    }
}

async function removeUser(em: EntityManager, email: string): Promise<Error | void> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");
    if (!email || typeof email !== "string")
        throw Error("Invalid params");

    try {
        const user = await em.findOneOrFail(User, { email: email });
        await em.removeAndFlush(user);
    } catch (ex) {
        return ex;
    }
}

async function updateUser(em: EntityManager, user: Partial<User>, email: string): Promise<Error | User> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");
    if (!user || typeof user !== "object" || !user.email || email !== user.email)
        throw Error("Invalid params");

    try {
        const editedUser = await em.findOneOrFail(User, { email: user.email });
        wrap(editedUser).assign(user);
        await em.persistAndFlush(editedUser);
        return editedUser;
    } catch (ex) {
        return ex;
    }
}

async function addUser(em: EntityManager, user: Partial<User>): Promise<Error | User> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");
    if (!user || typeof user !== "object" || !user.email || !user.firstName || !user.lastName || !user.email)
        throw Error("Invalid params");
    if (await getUserByEmail(em, user.email) != null)
        throw Error("E-mail address already associated with an account")

    try {
        const item = new User(user);
        await em.persistAndFlush(item);
        return item;
    } catch (ex) {
        return ex;
    }
}