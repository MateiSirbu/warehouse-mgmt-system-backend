import { Entity, SerializedPrimaryKey, PrimaryKey, Property, OneToOne } from "@mikro-orm/core";
import { ObjectId } from "mongodb";
import { User } from "./user.entity";

@Entity()
export class Employee {
    @PrimaryKey()
    _id!: ObjectId;

    @SerializedPrimaryKey()
    id!: string;

    @OneToOne(() => User, user => user.employee, { eager: true })
    user!: User;

    @Property()
    isAdmin!: boolean;

    public constructor(init?: Partial<Employee>) {
        Object.assign(this, init);
    }
}