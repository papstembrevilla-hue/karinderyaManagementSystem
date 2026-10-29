import FlashMessage from '@/components/FlashMessage';
import StatusBadge from '@/components/portal/status-badge';
import AppLayout from '@/layouts/app-layout';
import { formatDateTime, formatPeso, fulfillmentLabel, paymentStatusLabel } from '@/lib/portal';
import { type OrderSummary, type Paginated } from '@/types/portal';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

interface OrdersIndexProps {
    orders: Paginated<OrderSummary>;
    filters: {
        status: string;
        q: string;
    };
    statuses: string[];
}

export default function Index({ orders, filters, statuses }: OrdersIndexProps) {
    const [search, setSearch] = useState(filters.q ?? '');

    useEffect(() => {
        setSearch(filters.q ?? '');
    }, [filters.q]);

    const apply = (overrides: Record<string, string | undefined> = {}) => {
        const params: Record<string, string> = {
            ...(filters.q ? { q: filters.q } : {}),
            ...(filters.status ? { status: filters.status } : {}),
            ...overrides,
        };

        Object.keys(params).forEach((key) => {
            if (!params[key]) delete params[key];
        });

        router.get('/admin/orders', params, { preserveState: true, preserveScroll: true });
    };

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();
        apply({ q: search.trim() || undefined });
    };

    return (
        <AppLayout>
            <Head title="Orders" />
            <FlashMessage />

            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Orders</h1>
                    <p className="text-gray-500">Customer orders placed through the storefront.</p>
                </div>

                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <form onSubmit={submitSearch} className="relative sm:max-w-md sm:flex-1">
                        <Search className="absolute top-3 left-3 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search reference, customer, or phone…"
                            aria-label="Search orders"
                            className="w-full rounded-lg border px-10 py-2.5 outline-none focus:border-emerald-400"
                        />
                    </form>

                    <div className="flex flex-wrap gap-1.5">
                        <button
                            type="button"
                            onClick={() => apply({ status: undefined })}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                                !filters.status ? 'bg-emerald-600 text-white' : 'border text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            All
                        </button>
                        {statuses.map((status) => (
                            <button
                                key={status}
                                type="button"
                                onClick={() => apply({ status })}
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                                    filters.status === status ? 'bg-emerald-600 text-white' : 'border text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-xs tracking-wide text-gray-500 uppercase">
                                <tr>
                                    <th className="px-4 py-3">Reference</th>
                                    <th className="px-4 py-3">Customer</th>
                                    <th className="px-4 py-3">Placed</th>
                                    <th className="px-4 py-3">Fulfillment</th>
                                    <th className="px-4 py-3">Payment</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Total</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {orders.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                                            No orders match this filter.
                                        </td>
                                    </tr>
                                ) : (
                                    orders.data.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-semibold whitespace-nowrap">{order.reference}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{order.recipient_name ?? order.user?.name ?? 'Guest'}</div>
                                                <div className="text-xs text-gray-500">{order.user?.email ?? order.contact_phone ?? '—'}</div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-gray-600">{formatDateTime(order.created_at)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{fulfillmentLabel(order.fulfillment_method)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="capitalize">{order.payment_method === 'gcash' ? 'GCash' : 'Cash'}</span>
                                                <span className="text-xs text-gray-500"> · {paymentStatusLabel(order.payment_status)}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={order.status} fulfillment={order.fulfillment_method} />
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">{formatPeso(order.total)}</td>
                                            <td className="px-4 py-3 text-right">
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                    className="rounded-lg border px-3 py-1.5 text-xs font-semibold hover:border-emerald-500 hover:text-emerald-700"
                                                >
                                                    Open
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {orders.total > 0 && (
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
                        <span>
                            Showing {orders.from ?? 0}–{orders.to ?? 0} of {orders.total}
                        </span>
                        <div className="flex items-center gap-1">
                            {orders.links.map((link, index) => {
                                const isPrev = index === 0;
                                const isNext = index === orders.links.length - 1;

                                if (!link.url) {
                                    return (
                                        <span
                                            key={index}
                                            className="grid size-9 place-items-center rounded-lg border text-gray-300"
                                        >
                                            {isPrev ? <ChevronLeft size={16} /> : isNext ? <ChevronRight size={16} /> : '…'}
                                        </span>
                                    );
                                }

                                return (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        preserveScroll
                                        className={`grid size-9 place-items-center rounded-lg border text-sm font-medium ${
                                            link.active ? 'border-emerald-600 bg-emerald-600 text-white' : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        {isPrev ? <ChevronLeft size={16} /> : isNext ? <ChevronRight size={16} /> : link.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
