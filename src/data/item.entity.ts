import { Entity, SerializedPrimaryKey, PrimaryKey, Property, Unique } from "@mikro-orm/core";
import { ObjectId } from "mongodb";

@Entity()
export class Item{
    @PrimaryKey()
    _id!: ObjectId;

    @SerializedPrimaryKey()
    id!: string;

    @Unique()
    @Property()
    ean!: string;

    @Property()
    name!: string;

    @Property()
    uom!: string;

    public constructor(init?: Partial<Item>) {
        Object.assign(this, init);
    }
}