import { ManyToOne } from "@mikro-orm/core";
import { Entity, SerializedPrimaryKey, PrimaryKey, Property } from "@mikro-orm/core";
import { ObjectId } from "mongodb";
import { Item } from "./item.entity";
import { User } from "./user.entity";

@Entity()
export class CartItem {
    @PrimaryKey()
    _id!: ObjectId;

    @SerializedPrimaryKey()
    id!: string;

    @ManyToOne(() => User)
    user!: User;

    @ManyToOne(() => Item)
    item!: Item;

    @Property()
    qty!: number;

    public constructor(init?: Partial<CartItem>) {
        Object.assign(this, init);
    }
}