import { Entity, SerializedPrimaryKey, PrimaryKey, Property, OneToOne } from "@mikro-orm/core";
import { ObjectId } from "mongodb";
import { Customer } from "./customer.entity";
import { Employee } from "./employee.entity";

@Entity()
export class User {
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

    @OneToOne({ entity: () => Customer, mappedBy: 'user'})
    customer!: Customer | null;

    @OneToOne({ entity: () => Employee, mappedBy: 'user'})
    employee!: Employee | null;

    public constructor(init?: Partial<User>) {
        Object.assign(this, init);
    }
}
