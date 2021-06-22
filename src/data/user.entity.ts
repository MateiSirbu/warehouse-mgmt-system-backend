import { Entity, SerializedPrimaryKey, PrimaryKey, Property, OneToOne, OneToMany, Collection } from "@mikro-orm/core";
import { ObjectId } from "mongodb";
import { CartItem } from "./cartitem.entity";
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

    @OneToOne({ entity: () => Customer, inversedBy: customer => customer.user, eager: true, orphanRemoval: true })
    customer!: Customer;

    @OneToOne({ entity: () => Employee, inversedBy: employee => employee.user, eager: true, orphanRemoval: true })
    employee!: Employee;

    @OneToMany(() => CartItem, cartItem => cartItem.user, { eager: true })
    cartItems = new Collection<CartItem>(this);

    public constructor(init?: Partial<User>) {
        Object.assign(this, init);
    }
}