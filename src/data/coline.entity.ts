import { ManyToOne, Property } from "@mikro-orm/core";
import { Entity, SerializedPrimaryKey, PrimaryKey } from "@mikro-orm/core";
import { ObjectId } from "mongodb";
import { CustomerOrder } from "./customerorder.entity";
import { Item } from "./item.entity";

@Entity()
export class COLine {

    @PrimaryKey()
    _id!: ObjectId;

    @SerializedPrimaryKey()
    id!: string;

    @ManyToOne(() => CustomerOrder)
    order!: CustomerOrder;

    @ManyToOne(() => Item)
    item!: Item;

    @Property()
    qty!: number;

    @Property()
    filledQty!: number;

    public constructor(init?: Partial<COLine>) {
        Object.assign(this, init);
    }
}