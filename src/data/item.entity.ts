import { LoadStrategy } from "@mikro-orm/core";
import { Entity, SerializedPrimaryKey, PrimaryKey, Property, Unique, OneToMany, Cascade, Collection, wrap } from "@mikro-orm/core";
import { ObjectId } from "mongodb";
import { CartItem } from "./cartitem.entity";

@Entity()
export class Item {
    @PrimaryKey()
    _id!: ObjectId;

    @SerializedPrimaryKey()
    id!: string;

    @Unique()
    @Property()
    sku!: string;

    @Property()
    ean!: number;

    @Property()
    name!: string;

    @Property()
    uom!: string;

    @Property()
    unitprice!: number;

    @Property()
    stock!: number;

    @OneToMany(() => CartItem, cartItem => cartItem.item, { eager: true, cascade: [Cascade.ALL] })
    cartItems? = new Collection<CartItem>(this);

    public constructor(init?: Partial<Item>) {
        Object.assign(this, init);
    }
}