import StatusBadge from '@/components/portal/status-badge';
import PortalLayout from '@/layouts/portal-layout';
import { formatDateTime, formatPeso, fulfillmentLabel } from '@/lib/portal';
import { type SharedData } from '@/types';
import { type Address, type CartSummary, type OrderSummary } from '@/types/portal';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    ClipboardList,
    MapPin,
    ShoppingBasket,
    Store,
    UserRound,
    UtensilsCrossed,
} from 'lucide-react';

interface AccountProps {
    recentOrders: OrderSummary[];
    cart: CartSummary;
    addressCount: number;
    defaultAddress: Address | null;
}

export default function Account({ recentOrders, cart, addressCount, defaultAddress }: AccountProps) {
    const { auth } = usePage<SharedData>().props;
    const firstName = auth.user?.name?.split(' ')[0] ?? 'there';

    const quickLinks = [
        {
            title: 'Browse the menu',
            description: 'See today’s available dishes and prices.',
            href: route('menu.index'),
            icon: UtensilsCrossed,
        },
        {
            title: 'My cart',
            description:
                cart.item_count > 0
                    ? `${cart.item_count} item${cart.item_count === 1 ? '' : 's'} · ${formatPeso(cart.subtotal)}`
                    : 'Your cart is empty.',
            href: route('cart.index'),
            icon: ShoppingBasket,
        },
        {
            title: 'Order history',
            description: 'Track current orders and review past ones.',
            href: route('orders.index'),
            icon: ClipboardList,
        },
        {
            title: 'Profile & addresses',
            description:
                addressCount > 0
                    ? `${addressCount} saved address${addressCount === 1 ? '' : 'es'}.`
                    : 'Add a delivery address to check out faster.',
            href: route('portal.profile.edit'),
            icon: UserRound,
        },
    ];

    return (
        <PortalLayout>
            <Head title="My Account" />

            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-3xl border border-warm-line bg-gradient-to-br from-[#fff6ec] via-[#fdefe0] to-[#fbe4cf] px-5 py-7 sm:px-8 sm:py-9">
                    <span className="inline-flex items-center gap-2 text-[10.5px] font-extrabold tracking-[0.16em] text-brand-dark uppercase">
                        <span className="size-1.5 rounded-full bg-brand" />
                        My account
                    </span>
                    <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                        Kumusta, {firstName}!
                    </h1>
                    <p className="mt-1.5 max-w-xl text-sm text-[#7a6252]">
                        This is your personal karinderya page. Start an order, follow its progress, or update your details.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2.5">
                        <Link
                            href={route('menu.index')}
                            className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-[12.5px] font-bold text-white shadow-sm transition hover:bg-brand-dark"
                        >
                            Order food
                            <ArrowRight className="size-3.5" />
                        </Link>
                        <Link
                            href={route('cart.index')}
                            className="inline-flex items-center gap-2 rounded-xl border border-[#e4cdb7] bg-white/70 px-4 py-2.5 text-[12.5px] font-bold text-ink transition hover:border-brand"
                        >
                            <ShoppingBasket className="size-3.5" />
                            View cart
                            {cart.item_count > 0 && (
                                <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                                    {cart.item_count}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {quickLinks.map((link) => {
                        const Icon = link.icon;

                        return (
                            <Link
                                key={link.title}
                                href={link.href}
                                className="group flex items-start gap-3 rounded-2xl border border-warm-line bg-paper p-4 transition hover:border-[#dfc7b0] hover:shadow-sm"
                            >
                                <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#f0e0cc] bg-[#fbf0e3] text-brand transition group-hover:bg-brand group-hover:text-white">
                                    <Icon className="size-4.5" />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-[13px] font-extrabold">{link.title}</span>
                                    <span className="mt-0.5 block text-[11.5px] text-warm-muted">{link.description}</span>
                                </span>
                            </Link>
                        );
                    })}
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                    <section className="rounded-2xl border border-warm-line bg-paper">
                        <div className="flex items-center justify-between border-b border-warm-soft px-4 py-3">
                            <h2 className="text-sm font-extrabold">Recent orders</h2>
                            <Link href={route('orders.index')} className="text-[11.5px] font-bold text-brand-dark hover:underline">
                                View all
                            </Link>
                        </div>

                        {recentOrders.length === 0 ? (
                            <div className="px-4 py-10 text-center">
                                <div className="mx-auto grid size-12 place-items-center rounded-full border border-[#f0e0cc] bg-[#fbf0e3]">
                                    <ClipboardList className="size-5 text-brand" />
                                </div>
                                <p className="mt-3 text-[13px] font-bold">No orders yet</p>
                                <p className="mt-0.5 text-[11.5px] text-warm-muted">Your first order will show up here.</p>
                                <Link
                                    href={route('menu.index')}
                                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-[11.5px] font-bold text-white"
                                >
                                    Browse the menu
                                    <ArrowRight className="size-3.5" />
                                </Link>
                            </div>
                        ) : (
                            <ul className="divide-y divide-warm-soft">
                                {recentOrders.map((order) => (
                                    <li key={order.id}>
                                        <Link
                                            href={route('orders.show', order.id)}
                                            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 transition hover:bg-[#fdf6ee]"
                                        >
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-[12.5px] font-extrabold">{order.reference}</span>
                                                    <StatusBadge status={order.status} fulfillment={order.fulfillment_method} />
                                                </div>
                                                <p className="mt-0.5 text-[11px] text-warm-muted">
                                                    {formatDateTime(order.created_at)} · {fulfillmentLabel(order.fulfillment_method)} ·{' '}
                                                    {order.items_count} item{order.items_count === 1 ? '' : 's'}
                                                </p>
                                            </div>
                                            <span className="text-sm font-extrabold">{formatPeso(order.total)}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section className="space-y-4">
                        <div className="rounded-2xl border border-warm-line bg-paper p-4">
                            <div className="flex items-center gap-2">
                                <MapPin className="size-4 text-brand" />
                                <h2 className="text-sm font-extrabold">Default address</h2>
                            </div>
                            {defaultAddress ? (
                                <div className="mt-2.5 text-[12px] text-warm-muted">
                                    <p className="font-bold text-ink">{defaultAddress.recipient_name}</p>
                                    <p>{defaultAddress.phone}</p>
                                    <p className="mt-0.5">{defaultAddress.address}</p>
                                </div>
                            ) : (
                                <p className="mt-2 text-[11.5px] text-warm-muted">
                                    No saved address yet. You can still check out by entering your details.
                                </p>
                            )}
                            <Link
                                href={route('portal.addresses.index')}
                                className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-bold text-brand-dark hover:underline"
                            >
                                Manage addresses
                                <ArrowRight className="size-3" />
                            </Link>
                        </div>

                        <div className="rounded-2xl border border-warm-line bg-paper p-4">
                            <div className="flex items-center gap-2">
                                <Store className="size-4 text-brand" />
                                <h2 className="text-sm font-extrabold">Pickup & delivery</h2>
                            </div>
                            <p className="mt-2 text-[11.5px] text-warm-muted">
                                Choose pickup at the karinderya or delivery to a saved address during checkout. Pay with cash or
                                GCash when you receive your order.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </PortalLayout>
    );
}
