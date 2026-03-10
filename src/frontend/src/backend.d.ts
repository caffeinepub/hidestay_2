import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Booking {
    id: string;
    checkin: string;
    stayName: string;
    createdAt: bigint;
    guestName: string;
    email: string;
    checkout: string;
    phone: string;
    guests: bigint;
    location: string;
}
export interface Category {
    name: string;
    description: string;
}
export interface backendInterface {
    addCategory(name: string, description: string): Promise<void>;
    createBooking(stayName: string, location: string, checkin: string, checkout: string, guestName: string, phone: string, email: string, guests: bigint): Promise<Booking>;
    deleteCategory(name: string): Promise<void>;
    getAllBookings(): Promise<Array<Booking>>;
    getAllCategories(): Promise<Array<Category>>;
    getBooking(id: string): Promise<Booking>;
    getCategory(name: string): Promise<Category>;
}
