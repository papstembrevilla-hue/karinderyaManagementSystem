export interface Category {
    id: number;
    name: string;
    description?: string | null;
    available_items_count?: number;
}

export interface MenuItem {
    id: number;
    category_id: number;
    name: string;
    description: string | null;
    price: string | number;
    photo: string | null;
    is_available: boolean;
    category?: { id: number; name: string } | null;
}

export interface CartLine {
    id: number;
    menu_item_id: number;
    name: string;
    photo: string | null;
    category: string | null;
    unit_price: number;
    quantity: number;
    line_total: number;
    is_available: boolean;
}

export interface CartSummary {
    items: CartLine[];
    item_count: number;
    subtotal: number;
    has_unavailable: boolean;
}

export interface Address {
    id: number;
    user_id: number;
    label: string;
    recipient_name: string;
    phone: string;
    address: string;
    is_default: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface OrderItem {
    id: number;
    order_id: number;
    menu_item_id: number | null;
    item_name: string;
    unit_price: string | number;
    quantity: number;
    line_total: string | number;
}

export interface OrderStatusHistory {
    id: number;
    order_id: number;
    status: string;
    note: string | null;
    changed_by: number | null;
    created_at: string;
    changed_by_user?: { id: number; name: string } | null;
}

export interface OrderSummary {
    id: number;
    reference: string;
    status: string;
    fulfillment_method: string;
    payment_method: string;
    payment_status: string;
    payment_reference: string | null;
    subtotal: string | number;
    delivery_fee: string | number;
    discount: string | number;
    total: string | number;
    recipient_name: string | null;
    contact_phone: string | null;
    delivery_address: string | null;
    notes: string | null;
    cancelled_at: string | null;
    cancellation_reason: string | null;
    created_at: string;
    updated_at: string;
    items_count: number;
    user?: { id: number; name: string; email: string; phone: string | null };
}

export interface OrderDetail extends OrderSummary {
    items: OrderItem[];
    status_histories: OrderStatusHistory[];
}

export interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
}
