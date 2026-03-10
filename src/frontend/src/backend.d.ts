import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Category {
    name: string;
    description: string;
}
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
export interface GalleryImage {
    id: bigint;
    title: string;
    blob: ExternalBlob;
    description: string;
    timestamp: bigint;
}
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
export interface HotelOwner {
    password: string;
    name: string;
    email: string;
    phone: string;
}
export interface backendInterface {
    addCategory(name: string, description: string): Promise<void>;
    approveProperty(id: string): Promise<void>;
    createBooking(stayName: string, location: string, checkin: string, checkout: string, guestName: string, phone: string, email: string, guests: bigint): Promise<Booking>;
    deleteCategory(name: string): Promise<void>;
    deleteImage(id: bigint): Promise<void>;
    getAllApprovedProperties(): Promise<Array<Property>>;
    getAllBookings(): Promise<Array<Booking>>;
    getAllCategories(): Promise<Array<Category>>;
    getAllImages(): Promise<Array<GalleryImage>>;
    getAllPendingProperties(): Promise<Array<Property>>;
    getBooking(id: string): Promise<Booking>;
    getCategory(name: string): Promise<Category>;
    getImage(id: bigint): Promise<GalleryImage>;
    getMyProperties(ownerEmail: string): Promise<Array<Property>>;
    loginOwner(email: string, password: string): Promise<HotelOwner>;
    registerOwner(name: string, email: string, phone: string, password: string): Promise<HotelOwner>;
    rejectProperty(id: string): Promise<void>;
    submitProperty(propertyName: string, propertyType: string, city: string, address: string, contactPhone: string, description: string, imageUrls: Array<string>, pricePerNight: bigint, amenities: Array<string>, rules: string, checkinTime: string, checkoutTime: string, ownerEmail: string): Promise<Property>;
    uploadImage(title: string, description: string, blob: ExternalBlob): Promise<GalleryImage>;
}
