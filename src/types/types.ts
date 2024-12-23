export enum Status {
    active = 'active',
    inactive = 'inactive',
}

export interface Product {
    id?: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    createdAt?: Date;
    updatedAt?: Date;
    discountId?: number;
    discount?: Discount;
    brand: string;
    weight: number;
    length: number;
    width: number;
    height: number;
    status: Status;
    seoTitle: string;
    seoDescription: string;
    metaKeywords: string;
    subSubCategoryId?: number;
    subSubCategory?: SubSubCategory;
    images?: Image[];
    reviews?: Review[];
    filters?: FilterOption[];
}

export interface Discount {
    id: number;
    percentage: number;
    startDate: Date;
    endDate: Date;
    createdAt?: Date;
    updatedAt?: Date;
    description: string;
}

export interface SubSubCategory {
    id: number;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
    subCategoryId: number;
}

export enum FilterType {
    checkbox = 'checkbox',
    dropdown = 'dropdown',
    slider = 'slider',
}

export interface FilterOption {
    id: number;
    name: string;
    type: FilterType;
    filterValues: FilterValue[];
}

export interface FilterValue {
    id: number;
    value: string;
}

export interface Image {
    id: number;
    url: string;
    createdAt?: Date;
    updatedAt?: Date;
    productId: number;
}

export interface Review {
    id: number;
    rating: number;
    comment: string;
    createdAt?: Date;
    updatedAt?: Date;
    productId: number;
}

export interface Wishlist {
    id: string;
    userId: string;
    products: WishlistProduct[];
    createdAt: string;
    updatedAt: string;
}

export interface WishlistProduct {
    product: Product;
}


export interface UserPayload {
    userId: string;
  }