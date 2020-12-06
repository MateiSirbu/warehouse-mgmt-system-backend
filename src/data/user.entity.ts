import { Entity, SerializedPrimaryKey, PrimaryKey, Property } from "@mikro-orm/core";
import { ObjectId } from "mongodb";

@Entity()
export class User{
    @PrimaryKey()
    _id!: ObjectId;

    @SerializedPrimaryKey()
    id!: string;

    @Property()
    firstName!: string;

    @Property()
    lastName!: string;

    @Property()
    email!: string;

    @Property()
    hash!: string;

    @Property()
    salt!: string;

    public constructor(init?: Partial<User>) {
        Object.assign(this, init);
    }
}
