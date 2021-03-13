import { Entity, SerializedPrimaryKey, PrimaryKey, Property, OneToOne } from "@mikro-orm/core";
import { ObjectId } from "mongodb";
import { User } from "./user.entity";

@Entity()
export class Customer {
    @PrimaryKey()
    _id!: ObjectId;

    @SerializedPrimaryKey()
    id!: string;

    @Property()
    companyName!: string;

    @OneToOne({ entity: () => User, inversedBy: 'customer'})
    user!: User;

    public constructor(init?: Partial<Customer>) {
        Object.assign(this, init);
    }
}