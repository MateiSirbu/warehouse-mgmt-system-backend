import { Item } from "../data/item.entity";
import { EntityManager, wrap } from "@mikro-orm/core";
import * as customerOrderService from "../services/customerorder.service"

export {
    getAllItems,
    getItemById,
    getItemBySKU,
    updateItem,
    addItem,
};

async function getAllItems(em: EntityManager): Promise<Error | Item[]> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");

    try {
        const items = await em.find(Item, {});
        if (!(items instanceof Error)) {
            for (let i = 0; i < items.length; i++) {
                let reservedStock = await customerOrderService.computeItemReservedStock(em, items[i].id)
                if (typeof (reservedStock) == 'number') {
                    items[i].availableQty = items[i].stock - reservedStock
                }
            }
        }
        return items;
    } catch (ex) {
        console.log(ex)
        throw ex;
    }
}

async function getItemById(em: EntityManager, id: string): Promise<Error | Item | null> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");
    if (!id || typeof id !== "string")
        throw Error("Malformed input");
    try {
        const item = em.findOne(Item, { id: id });
        if (item instanceof Item) {
            let reservedStock = await customerOrderService.computeItemReservedStock(em, item.id)
            if (typeof (reservedStock) == 'number') {
                item.availableQty = item.stock - reservedStock
            }
        }
        return item;
    } catch (ex) {
        console.log(ex)
        throw ex;
    }
}

async function getItemBySKU(em: EntityManager, sku: string): Promise<Error | Item | null> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");
    if (!sku || typeof sku !== "string")
        throw Error("Malformed input");

    try {
        const item = await em.findOne(Item, { sku: sku });
        return item;
    } catch (ex) {
        console.log(ex)
        throw ex;
    }
}

async function updateItem(em: EntityManager, item: Partial<Item>): Promise<Error | Item> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");
    if (!item || typeof item !== "object")
        throw Error("Malformed input");

    try {
        const editedItem = await em.findOneOrFail(Item, { id: item.id });
        wrap(editedItem).assign(item);
        await em.persistAndFlush(editedItem);
        return editedItem;
    } catch (ex) {
        console.log(ex)
        throw ex;
    }
}

async function addItem(em: EntityManager, item: Partial<Item>): Promise<Error | Item> {
    if (!(em instanceof EntityManager))
        throw Error("Invalid request");
    if (!item || typeof item !== "object" || item.sku == null || !item.ean == null || !item.name == null || !item.uom == null || !item.unitprice == null || !item.stock == null)
        throw Error("Malformed input");
    if (await getItemBySKU(em, item.sku) != null)
        throw Error("The provided SKU already exists")

    try {
        const newItem = new Item(item);
        await em.persistAndFlush(newItem);
        return newItem;
    } catch (ex) {
        console.log(ex)
        throw ex;
    }
}