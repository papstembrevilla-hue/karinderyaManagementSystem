import PortalPagination from '@/components/portal/pagination';
import StatusBadge from '@/components/portal/status-badge';
import PortalLayout from '@/layouts/portal-layout';
import { formatDateTime, formatPeso, fulfillmentLabel } from '@/lib/portal';
import { type OrderSummary, type Paginated } from '@/types/portal';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowRight, ClipboardList, Search } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

interface OrdersIndexProps {
    orders: Paginated<OrderSummary>;
    filters: {
        status: string;
        q: string;
    };
    statuses: string[];
}

export default function OrdersIndex({ orders, filters, statuses }: OrdersIndexProps) {
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

        router.get(route('orders.index'), params, { preserveState: true, preserveScroll: true });
    };

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();
        apply({ q: search.trim() || undefined });
    };

    return (
        <PortalLayout>
            <Head title="My Orders" />

            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <span className="inline-flex items-center gap-2 text-[10.5px] font-extrabold tracking-[0.16em] text-brand-dark uppercase">
                    <span className="size-1.5 rounded-full bg-brand" />
                    My orders
                </span>
                <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">Order history</h1>
                <p className="mt-1.5 text-sm text-warm-muted">Only orders placed by your account are shown here.</p>

                <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-warm-line bg-paper p-2.5">
                    <form onSubmit={submitSearch} className="flex items-center gap-2 px-1.5">
                        <Search className="size-4 text-warm-muted" />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search by order reference…"
                            aria-label="Search by order reference"
                            className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-[#ae9c8b]"
                        />
                        <button type="submit" className="rounded-lg bg-ink px-3 py-1.5 text-[11px] font-bold text-white">
                            Search
                        </button>
                    </form>

                    <div className="flex flex-wrap gap-1.5 border-t border-warm-soft pt-2.5">
                        <button
                            type="button"
                            onClick={() => apply({ status: undefined })}
                            className={`rounded-full px-3 py-1.5 text-[11.5px] font-bold transition ${
                                !filters.status ? 'bg-ink text-white' : 'text-warm-muted hover:bg-warm-soft'
                            }`}
                        >
                            All
                        </button>
                        {statuses.map((status) => (
                            <button
                                key={status}
                                type="button"
                                onClick={() => apply({ status })}
                                className={`rounded-full px-3 py-1.5 text-[11.5px] font-bold capitalize transition ${
                                    filters.status === status ? 'bg-ink text-white' : 'text-warm-muted hover:bg-warm-soft'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {orders.data.length === 0 ? (
                    <div className="mt-6 rounded-2xl border border-dashed border-[#dcc9b4] bg-paper px-6 py-14 text-center">
                        <div className="mx-auto grid size-14 place-items-center rounded-full border border-[#f0e0cc] bg-[#fbf0e3]">
                            <ClipboardList className="size-6 text-brand" />
                        </div>
                        <h2 className="mt-3 text-base font-bold">No orders here yet</h2>
                        <p className="mx-auto mt-1 max-w-md text-xs text-warm-muted">
                            {filters.status || filters.q
                                ? 'No orders match this filter. Try clearing it.'
                                : 'When you place an order, it will appear here with its live status.'}
                        </p>
                        <Link
                            href={route('menu.index')}
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white"
                        >
                            Browse the menu
                            <ArrowRight className="size-3.5" />
                        </Link>
                    </div>
                ) : (
                    <div className="mt-5 space-y-3">
                        {orders.data.map((order) => (
                            <article key={order.id} className="rounded-2xl border border-warm-line bg-paper p-4 transition hover:border-[#dfc7b0] sm:p-5">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="text-sm font-extrabold tracking-tight">{order.reference}</h2>
                                            <StatusBadge status={order.status} fulfillment={order.fulfillment_method} />
                                        </div>
                                        <p className="mt-1 text-[11.5px] text-warm-muted">
                                            {formatDateTime(order.created_at)} · {fulfillmentLabel(order.fulfillment_method)} ·{' '}
                                            {order.items_count} item{order.items_count === 1 ? '' : 's'}
                                        </p>
                                    </div>

                                    <Link
                                        href={route('orders.show', order.id)}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-warm-line px-3 py-2 text-[11.5px] font-bold transition hover:border-brand hover:text-brand-dark"
                                    >
                                        View order
                                        <ArrowRight className="size-3.5" />
                                    </Link>
                                </div>

                                <div className="mt-3 flex items-end justify-between gap-3 border-t border-warm-soft pt-3">
                                    <div className="text-[11.5px] text-warm-muted">
                                        {order.payment_method === 'gcash' ? 'GCash' : 'Cash'} · {order.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-[10px] font-bold tracking-[0.08em] text-warm-muted uppercase">Total</span>
                                        <span className="text-lg font-extrabold tracking-tight">{formatPeso(order.total)}</span>
                                    </div>
                                </div>
                            </article>
                        ))}

                        <PortalPagination paginator={orders} className="pt-3" />
                    </div>
                )}
            </div>
        </PortalLayout>
    );
}
