import { Product } from './product.model';

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    selected_size?: string | null;
    price: number;
    product: Product;
}

export interface Order {
    id: number;
    user_id: number;
    status: string;
    subtotal: number;
    shipping: number;
    total: number;
    shipping_name: string;
    shipping_email: string;
    shipping_address: string;
    shipping_city: string;
    shipping_zip: string;
    payment_method: string;
    items: OrderItem[];
    created_at?: string;
    updated_at?: string;
}

export interface OrderRequest {
    shipping_name: string;
    shipping_email: string;
    shipping_address: string;
    shipping_city: string;
    shipping_zip: string;
    payment_method: string;
}
