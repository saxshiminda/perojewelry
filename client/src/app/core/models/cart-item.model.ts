import { Product } from './product.model';

export interface CartItem {
    id: number;
    user_id: number;
    product_id: number;
    quantity: number;
    selected_size?: string | null;
    product: Product;
    created_at?: string;
    updated_at?: string;
}
