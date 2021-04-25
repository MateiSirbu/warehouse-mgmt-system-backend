import { Entity, SerializedPrimaryKey, PrimaryKey, Property, Unique } from "@mikro-orm/core";
import { ObjectId } from "mongodb";

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

    public constructor(init?: Partial<Item>) {
        Object.assign(this, init);
    }
}