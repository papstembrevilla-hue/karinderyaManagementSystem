import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    brand: string;
    quote: { message: string; author: string };
    auth: Auth;
    cartCount: number;
    portal: PortalConfig;
    flash: FlashData;
    [key: string]: unknown;
}

export interface PortalConfig {
    delivery_fee: number;
    payment_methods: string[];
    fulfillment_methods: string[];
}

export interface FlashData {
    success?: string | null;
    error?: string | null;
    order_placed?: string | null;
}

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    avatar?: string;
    role: 'admin' | 'user';
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
