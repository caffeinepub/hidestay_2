import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Property {
    id: string;
    ownerEmail: string;
    status: string;
    propertyName: string;
    propertyType: string;
    imageUrls: Array<string>;
    checkinTime: string;
    city: string;
    pricePerNight: bigint;
    description: string;
    amenities: Array<string>;
    address: string;
    rules: string;
    checkoutTime: string;
    contactPhone: string;
}
export interface Booking {
    id: string;
    status: string;
    checkin: string;
    stayName: string;
    createdAt: bigint;
    propertyId: string;
    guestName: string;
    email: string;
    checkout: string;
    phone: string;
    guests: bigint;
    location: string;
}
export interface Customer {
    active: boolean;
    password: string;
    name: string;
    email: string;
    phone: string;
}
export interface UserProfile {
    userType: string;
    name: string;
    email: string;
    phone: string;
}
export interface HotelOwner {
    active: boolean;
    password: string;
    name: string;
    email: string;
    phone: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    approveProperty(id: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createBooking(propertyId: string, stayName: string, location: string, checkin: string, checkout: string, guestName: string, phone: string, email: string, guests: bigint): Promise<Booking>;
    deleteBooking(id: string): Promise<void>;
    deleteCustomer(email: string): Promise<void>;
    deleteOwner(email: string): Promise<void>;
    deleteProperty(id: string): Promise<void>;
    disableCustomer(email: string): Promise<void>;
    disableOwner(email: string): Promise<void>;
    enableCustomer(email: string): Promise<void>;
    enableOwner(email: string): Promise<void>;
    getAllApprovedProperties(): Promise<Array<Property>>;
    getAllBookings(): Promise<Array<Booking>>;
    getAllCustomers(): Promise<Array<Customer>>;
    getAllOwners(): Promise<Array<HotelOwner>>;
    getAllPendingProperties(): Promise<Array<Property>>;
    getAllProperties(): Promise<Array<Property>>;
    getBookingById(id: string): Promise<Booking>;
    getBookingsByCustomerEmail(email: string): Promise<Array<Booking>>;
    getBookingsByPropertyId(propertyId: string): Promise<Array<Booking>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCustomerByEmail(email: string): Promise<Customer>;
    getPropertiesByOwner(ownerEmail: string): Promise<Array<Property>>;
    getPropertyById(id: string): Promise<Property>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    loginCustomer(email: string, password: string): Promise<Customer>;
    loginOwner(email: string, password: string): Promise<HotelOwner>;
    registerCustomer(name: string, email: string, phone: string, password: string): Promise<Customer>;
    registerOwner(name: string, email: string, phone: string, password: string): Promise<HotelOwner>;
    rejectProperty(id: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitProperty(propertyName: string, propertyType: string, city: string, address: string, contactPhone: string, description: string, imageUrls: Array<string>, pricePerNight: bigint, amenities: Array<string>, rules: string, checkinTime: string, checkoutTime: string, ownerEmail: string): Promise<Property>;
    updateBookingStatus(id: string, newStatus: string): Promise<void>;
    updateCustomerPassword(email: string, newPassword: string): Promise<void>;
}
