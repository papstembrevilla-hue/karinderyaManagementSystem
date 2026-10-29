import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowDownToLine,
    ArrowUpFromLine,
    Boxes,
    CalendarClock,
    CircleDollarSign,
    EyeOff,
    PackageX,
    Truck,
    UserRound,
    Users,
    UtensilsCrossed,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin/dashboard',
    },
];

interface Stats {
    totalIngredients: number;
    inStockCount: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalInventoryValue: number;
    totalCustomers: number;
    activeCustomers: number;
    totalMenuItems: number;
    unavailableMenuItems: number;
    totalCategories: number;
    totalSuppliers: number;
}

interface LowStockIngredient {
    id: number;
    ingredient_name: string;
    unit: string;
    quantity: number;
    reorder_level: number;
    status: string;
}

interface ExpiringIngredient {
    id: number;
    ingredient_name: string;
    unit: string;
    quantity: number;
    expiration_date: string;
    status: string;
}

interface RecentCustomer {
    id: number;
    customer_code: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    is_active: boolean;
}

interface RecentIngredient {
    id: number;
    ingredient_name: string;
    category: string | null;
    unit: string;
    quantity: number;
    status: string;
}

interface Props {
    stats: Stats;
    lowStockIngredients: LowStockIngredient[];
    expiringSoon: ExpiringIngredient[];
    recentCustomers: RecentCustomer[];
    recentIngredients: RecentIngredient[];
    recentMenuItems: RecentMenuItem[];
    recentStockIns: RecentStockIn[];
    recentStockOuts: RecentStockOut[];
}

interface RecentMenuItem {
    id: number;
    name: string;
    price: string | number;
    is_available: boolean;
    category: { id: number; name: string } | null;
}

interface RecentStockIn {
    id: number;
    quantity: string | number;
    received_at: string;
    ingredient: { id: number; ingredient_name: string; unit: string } | null;
    supplier: { id: number; name: string } | null;
}

interface RecentStockOut {
    id: number;
    quantity: string | number;
    reason: string;
    occurred_at: string;
    ingredient: { id: number; ingredient_name: string; unit: string } | null;
}

export default function Dashboard({
    stats,
    lowStockIngredients,
    expiringSoon,
    recentCustomers,
    recentIngredients,
    recentMenuItems,
    recentStockIns,
    recentStockOuts,
}: Props) {
    const statCards = [
        {
            title: 'Total Menu Items',
            value: stats.totalMenuItems,
            subtitle: `${stats.totalCategories} categories`,
            icon: UtensilsCrossed,
            gradient: 'bg-emerald-100 text-emerald-600',
        },
        {
            title: 'Unavailable Items',
            value: stats.unavailableMenuItems,
            subtitle: 'Hidden from ordering',
            icon: EyeOff,
            gradient: 'bg-slate-100 text-slate-600',
        },
        {
            title: 'Total Ingredients',
            value: stats.totalIngredients,
            subtitle: `${stats.inStockCount} in stock`,
            icon: Boxes,
            gradient: 'bg-blue-100 text-blue-600',
        },
        {
            title: 'Inventory Value',
            value: `₱${Number(stats.totalInventoryValue).toFixed(2)}`,
            subtitle: 'Total stock cost',
            icon: CircleDollarSign,
            gradient: 'bg-green-100 text-green-600',
        },
        {
            title: 'Stock Alerts',
            value: stats.lowStockCount + stats.outOfStockCount,
            subtitle: `${stats.lowStockCount} low · ${stats.outOfStockCount} out`,
            icon: stats.outOfStockCount > 0 ? PackageX : AlertTriangle,
            gradient: 'bg-red-100 text-red-600',
        },
        {
            title: 'Suppliers',
            value: stats.totalSuppliers,
            subtitle: 'Active suppliers',
            icon: Truck,
            gradient: 'bg-teal-100 text-teal-600',
        },
        {
            title: 'Total Customers',
            value: stats.totalCustomers,
            subtitle: `${stats.activeCustomers} active`,
            icon: Users,
            gradient: 'bg-orange-100 text-orange-600',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="space-y-6 p-6">
                {/* HEADER */}

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Admin Dashboard
                        </h1>
                        <p className="text-sm text-gray-500">
                            Overview of your karinderya inventory and
                            customers.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/admin/ingredients/create"
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            + Add Ingredient
                        </Link>

                        <Link
                            href="/admin/menu-items/create"
                            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                        >
                            + Add Menu Item
                        </Link>

                        <Link
                            href="/customers/create"
                            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                        >
                            + Add Customer
                        </Link>
                    </div>
                </div>

                {/* STAT CARDS */}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {statCards.map((card) => (
                        <div
                            key={card.title}
                            className="flex items-center gap-4 rounded-xl border bg-white p-5 shadow-sm"
                        >
                            <div
                                className={`rounded-lg p-3 ${card.gradient}`}
                            >
                                <card.icon size={24} />
                            </div>

                            <div className="min-w-0">
                                <p className="text-sm text-gray-500">
                                    {card.title}
                                </p>

                                <p className="truncate text-2xl font-bold">
                                    {card.value}
                                </p>

                                <p className="text-xs text-gray-400">
                                    {card.subtitle}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* LOW STOCK */}

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-lg bg-red-100 p-2.5 text-red-600">
                                <AlertTriangle size={20} />
                            </div>

                            <div>
                                <h2 className="font-bold">
                                    Low Stock Ingredients
                                </h2>

                                <p className="text-xs text-gray-500">
                                    Items at or below their reorder level.
                                </p>
                            </div>

                            <Link
                                href="/admin/ingredients"
                                className="ml-auto text-sm text-blue-600 hover:underline"
                            >
                                View all
                            </Link>
                        </div>

                        {lowStockIngredients.length === 0 ? (
                            <p className="py-6 text-center text-sm text-gray-500">
                                Everything is well stocked. 🎉
                            </p>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {lowStockIngredients.map((ingredient) => (
                                    <li
                                        key={ingredient.id}
                                        className="flex items-center justify-between py-3"
                                    >
                                        <div>
                                            <Link
                                                href={`/admin/ingredients/${ingredient.id}`}
                                                className="font-medium hover:underline"
                                            >
                                                {ingredient.ingredient_name}
                                            </Link>

                                            <p className="text-xs text-gray-500">
                                                Reorder at{' '}
                                                {ingredient.reorder_level}{' '}
                                                {ingredient.unit}
                                            </p>
                                        </div>

                                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                                            {ingredient.quantity}{' '}
                                            {ingredient.unit}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* EXPIRING SOON */}

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-lg bg-yellow-100 p-2.5 text-yellow-600">
                                <CalendarClock size={20} />
                            </div>

                            <div>
                                <h2 className="font-bold">
                                    Expiring Soon
                                </h2>

                                <p className="text-xs text-gray-500">
                                    Ingredients expiring within 7 days.
                                </p>
                            </div>
                        </div>

                        {expiringSoon.length === 0 ? (
                            <p className="py-6 text-center text-sm text-gray-500">
                                Nothing expiring in the next 7 days.
                            </p>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {expiringSoon.map((ingredient) => (
                                    <li
                                        key={ingredient.id}
                                        className="flex items-center justify-between py-3"
                                    >
                                        <div>
                                            <Link
                                                href={`/admin/ingredients/${ingredient.id}`}
                                                className="font-medium hover:underline"
                                            >
                                                {ingredient.ingredient_name}
                                            </Link>

                                            <p className="text-xs text-gray-500">
                                                {ingredient.quantity}{' '}
                                                {ingredient.unit}
                                            </p>
                                        </div>

                                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                                            {ingredient.expiration_date}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* RECENT ACTIVITY */}

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* RECENT INGREDIENTS */}

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-lg bg-blue-100 p-2.5 text-blue-600">
                                <Boxes size={20} />
                            </div>

                            <div>
                                <h2 className="font-bold">
                                    Recently Added Ingredients
                                </h2>

                                <p className="text-xs text-gray-500">
                                    The latest items added to your inventory.
                                </p>
                            </div>

                            <Link
                                href="/admin/ingredients"
                                className="ml-auto text-sm text-blue-600 hover:underline"
                            >
                                View all
                            </Link>
                        </div>

                        {recentIngredients.length === 0 ? (
                            <p className="py-6 text-center text-sm text-gray-500">
                                No ingredients yet.
                            </p>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {recentIngredients.map((ingredient) => (
                                    <li
                                        key={ingredient.id}
                                        className="flex items-center justify-between py-3"
                                    >
                                        <div>
                                            <Link
                                                href={`/admin/ingredients/${ingredient.id}`}
                                                className="font-medium hover:underline"
                                            >
                                                {ingredient.ingredient_name}
                                            </Link>

                                            <p className="text-xs text-gray-500">
                                                {ingredient.quantity}{' '}
                                                {ingredient.unit}
                                                {ingredient.category
                                                    ? ` · ${ingredient.category}`
                                                    : ''}
                                            </p>
                                        </div>

                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                ingredient.status === 'In Stock'
                                                    ? 'bg-green-100 text-green-700'
                                                    : ingredient.status ===
                                                      'Low Stock'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}
                                        >
                                            {ingredient.status}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* RECENT CUSTOMERS */}

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-lg bg-orange-100 p-2.5 text-orange-600">
                                <UserRound size={20} />
                            </div>

                            <div>
                                <h2 className="font-bold">Recent Customers</h2>

                                <p className="text-xs text-gray-500">
                                    The latest customers added to your records.
                                </p>
                            </div>

                            <Link
                                href="/customers"
                                className="ml-auto text-sm text-blue-600 hover:underline"
                            >
                                View all
                            </Link>
                        </div>

                        {recentCustomers.length === 0 ? (
                            <p className="py-6 text-center text-sm text-gray-500">
                                No customers yet.
                            </p>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {recentCustomers.map((customer) => (
                                    <li
                                        key={customer.id}
                                        className="flex items-center justify-between py-3"
                                    >
                                        <div>
                                            <Link
                                                href={`/customers/${customer.id}`}
                                                className="font-medium hover:underline"
                                            >
                                                {customer.first_name}{' '}
                                                {customer.last_name}
                                            </Link>

                                            <p className="text-xs text-gray-500">
                                                {customer.customer_code}
                                                {customer.email
                                                    ? ` · ${customer.email}`
                                                    : ''}
                                            </p>
                                        </div>

                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                customer.is_active
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            {customer.is_active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* RECENT MENU ITEMS */}

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-lg bg-emerald-100 p-2.5 text-emerald-600">
                                <UtensilsCrossed size={20} />
                            </div>

                            <div>
                                <h2 className="font-bold">Recent Menu Items</h2>

                                <p className="text-xs text-gray-500">
                                    The latest dishes added to your menu.
                                </p>
                            </div>

                            <Link
                                href="/admin/menu-items"
                                className="ml-auto text-sm text-blue-600 hover:underline"
                            >
                                View all
                            </Link>
                        </div>

                        {recentMenuItems.length === 0 ? (
                            <p className="py-6 text-center text-sm text-gray-500">
                                No menu items yet.
                            </p>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {recentMenuItems.map((item) => (
                                    <li
                                        key={item.id}
                                        className="flex items-center justify-between py-3"
                                    >
                                        <div>
                                            <Link
                                                href={`/admin/menu-items/${item.id}`}
                                                className="font-medium hover:underline"
                                            >
                                                {item.name}
                                            </Link>

                                            <p className="text-xs text-gray-500">
                                                ₱
                                                {Number(item.price).toFixed(2)}
                                                {item.category
                                                    ? ` · ${item.category.name}`
                                                    : ''}
                                            </p>
                                        </div>

                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                item.is_available
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            {item.is_available
                                                ? 'Available'
                                                : 'Unavailable'}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* RECENT STOCK MOVEMENTS */}

                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-lg bg-indigo-100 p-2.5 text-indigo-600">
                                <ArrowDownToLine size={20} />
                            </div>

                            <div>
                                <h2 className="font-bold">
                                    Recent Stock Movements
                                </h2>

                                <p className="text-xs text-gray-500">
                                    Latest stock-in and stock-out records.
                                </p>
                            </div>
                        </div>

                        {recentStockIns.length === 0 &&
                        recentStockOuts.length === 0 ? (
                            <p className="py-6 text-center text-sm text-gray-500">
                                No stock movements yet.
                            </p>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {recentStockIns.map((stockIn) => (
                                    <li
                                        key={`in-${stockIn.id}`}
                                        className="flex items-center justify-between py-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="rounded-full bg-blue-100 p-1.5 text-blue-600">
                                                <ArrowDownToLine size={14} />
                                            </span>

                                            <div>
                                                <p className="font-medium">
                                                    {stockIn.ingredient
                                                        ?.ingredient_name ||
                                                        '-'}
                                                </p>

                                                <p className="text-xs text-gray-500">
                                                    {stockIn.received_at?.slice(
                                                        0,
                                                        10,
                                                    )}
                                                    {stockIn.supplier
                                                        ? ` · ${stockIn.supplier.name}`
                                                        : ''}
                                                </p>
                                            </div>
                                        </div>

                                        <span className="text-sm font-medium text-blue-600">
                                            +{stockIn.quantity}{' '}
                                            {stockIn.ingredient?.unit}
                                        </span>
                                    </li>
                                ))}

                                {recentStockOuts.map((stockOut) => (
                                    <li
                                        key={`out-${stockOut.id}`}
                                        className="flex items-center justify-between py-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="rounded-full bg-rose-100 p-1.5 text-rose-600">
                                                <ArrowUpFromLine size={14} />
                                            </span>

                                            <div>
                                                <p className="font-medium">
                                                    {stockOut.ingredient
                                                        ?.ingredient_name ||
                                                        '-'}
                                                </p>

                                                <p className="text-xs text-gray-500">
                                                    {stockOut.occurred_at?.slice(
                                                        0,
                                                        10,
                                                    )}{' '}
                                                    · {stockOut.reason}
                                                </p>
                                            </div>
                                        </div>

                                        <span className="text-sm font-medium text-rose-600">
                                            -{stockOut.quantity}{' '}
                                            {stockOut.ingredient?.unit}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
