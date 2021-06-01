
import { EntityManager, wrap } from "@mikro-orm/core";
import { CartItem } from "../data/cartitem.entity";
import { User } from "../data/user.entity";

export {
    getCartItemsByUser,
    updateCartItem,
    addCartItem,
};

async function getCartItemsByUser(em: EntityManager, user: User): Promise<Error | CartItem[]> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");

    try {
        const u = await em.findOneOrFail(User, { id: user.id }, { populate: true });
        return u.cartItems.loadItems()
    } catch (ex) {
        console.log(ex)
        return ex;
    }
}

async function clearCart(em: EntityManager, user: User): Promise<Error | void> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");

    try {
        const u = await em.findOneOrFail(User, { id: user.id });
        await em.removeAndFlush(u.cartItems);
    } catch (ex) {
        console.log(ex)
        return ex;
    }
}

async function updateCartItem(em: EntityManager, item: Partial<CartItem>): Promise<Error | CartItem> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");
    if (!item || typeof item !== "object")
        throw Error("Malformed input");

    try {
        const editedItem = await em.findOneOrFail(CartItem, { id: item.id });
        wrap(editedItem).assign(item);
        await em.persistAndFlush(editedItem);
        return editedItem;
    } catch (ex) {
        console.log(ex)
        return ex;
    }
}

async function addCartItem(em: EntityManager, cartItem: Partial<CartItem>, user: User): Promise<Error | CartItem> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");
    if (!cartItem || typeof cartItem !== "object" || cartItem.item == null)
        throw Error("Malformed input");

    try {
        console.log(cartItem)
        const newItem = new CartItem(cartItem);
        newItem.user = user;
        await em.persistAndFlush(newItem);
        return newItem;
    } catch (ex) {
        console.log(ex)
        return ex;
    }
}