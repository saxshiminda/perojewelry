export interface ProductImage {
    id?: number;
    product_id?: number;
    image_url: string;
    is_primary: boolean;
    sort_order?: number;
}

export interface SizeOption {
    label: string;
    stock: number;
}

export interface Product {
    id?: number;
    name: string;
    description?: string;
    material?: string | null;
    finish?: string | null;
    dimensions?: string | null;
    size_options?: SizeOption[] | null;
    price: number;
    sale_price?: number | null;
    discount_type?: string | null;
    discount_value?: number | null;
    stock: number;
    category_id?: number | null;
    category?: { id?: number, name: string, slug?: string };
    is_featured?: boolean;
    is_on_sale?: boolean;
    effective_price?: number;
    primary_image_url?: string | null;
    images?: ProductImage[];
    average_rating?: number;
    reviews_count?: number;
    created_at?: string;
    updated_at?: string;
}
