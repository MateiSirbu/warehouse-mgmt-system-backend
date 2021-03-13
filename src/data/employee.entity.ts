import { Entity, SerializedPrimaryKey, PrimaryKey, Property, OneToOne } from "@mikro-orm/core";
import { ObjectId } from "mongodb";
import { User } from "./user.entity";

@Entity()
export class Employee {
    @PrimaryKey()
    _id!: ObjectId;

    @SerializedPrimaryKey()
    id!: string;

    @Property()
    isAdmin!: boolean;

    @OneToOne({ entity: () => User, inversedBy: 'employee'})
    user!: User;

    public constructor(init?: Partial<Employee>) {
        Object.assign(this, init);
    }
}