import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Category {
    name: string;
    description: string;
}
export interface backendInterface {
    addCategory(name: string, description: string): Promise<void>;
    deleteCategory(name: string): Promise<void>;
    getAllCategories(): Promise<Array<Category>>;
    getCategory(name: string): Promise<Category>;
}
