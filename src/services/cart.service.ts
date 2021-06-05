
import { EntityManager, wrap } from "@mikro-orm/core";
import { CartItem } from "../data/cartitem.entity";
import { User } from "../data/user.entity";

export {
    getCartItemsByUser,
    updateCartItem,
    addCartItem,
    clearCart,
    getCartItem,
    deleteCartItem
};

async function getCartItemsByUser(em: EntityManager, user: User): Promise<Error | CartItem[]> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");

    try {
        const u = await em.findOneOrFail(User, { id: user.id }, ['cartItems', 'cartItems.item']);
        return u.cartItems.loadItems()
    } catch (ex) {
        console.log(ex)
        throw ex;
    }
}

async function clearCart(em: EntityManager, user: User): Promise<Error | void[]> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");

    try {
        const u = await em.findOneOrFail(User, { id: user.id });
        const cartItems = u.cartItems.toArray().map(item => em.create(CartItem, item));
        return Promise.all(cartItems.map(async (item) => {
            await em.nativeDelete(CartItem, { id: item.id })
            await em.flush()
            return;
        }));
    } catch (ex) {
        console.log(ex)
        throw ex;
    }
}

async function deleteCartItem(em: EntityManager, id: string): Promise<Error | void> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");

    try {
        await em.nativeDelete(CartItem, { id: id })
        return em.flush()
    } catch (ex) {
        console.log(ex)
        throw ex;
    }
}

async function getCartItem(em: EntityManager, id: string): Promise<Error | CartItem> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");

    try {
        return await em.findOneOrFail(CartItem, { id: id })
    } catch (ex) {
        console.log(ex)
        throw ex;
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
        throw ex;
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
        throw ex;
    }
}