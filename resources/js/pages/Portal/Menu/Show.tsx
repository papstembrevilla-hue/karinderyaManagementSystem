import FoodCard from '@/components/portal/food-card';
import FoodImage from '@/components/portal/food-image';
import PortalLayout from '@/layouts/portal-layout';
import { formatPeso } from '@/lib/portal';
import { type SharedData } from '@/types';
import { type MenuItem } from '@/types/portal';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, LoaderCircle, Minus, Plus, ShoppingBasket } from 'lucide-react';
import { useState } from 'react';

interface MenuShowProps {
    menuItem: MenuItem;
    related: MenuItem[];
}

interface PageErrors extends SharedData {
    errors: Record<string, string>;
}

export default function MenuShow({ menuItem, related }: MenuShowProps) {
    const { auth } = usePage<PageErrors>().props;
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    const canOrder = auth.user?.role === 'user';

    const addToCart = () => {
        router.post(
            route('cart.store'),
            { menu_item_id: menuItem.id, quantity },
            {
                preserveScroll: true,
                onStart: () => setAdding(true),
                onFinish: () => setAdding(false),
            },
        );
    };

    return (
        <PortalLayout>
            <Head title={menuItem.name} />

            <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
                <Link href={route('menu.index')} className="inline-flex items-center gap-1.5 text-xs font-bold text-warm-muted hover:text-ink">
                    <ArrowLeft className="size-3.5" />
                    Back to menu
                </Link>

                <div className="mt-4 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
                    <div className="overflow-hidden rounded-2xl border border-warm-line bg-paper">
                        <div className="relative aspect-[4/3]">
                            <FoodImage photo={menuItem.photo} name={menuItem.name} seed={menuItem.id} />
                            {!menuItem.is_available && (
                                <div className="absolute inset-0 grid place-items-center bg-ink/45">
                                    <span className="rounded-full bg-white px-4 py-1.5 text-xs font-extrabold tracking-[0.08em] text-warm-muted uppercase">
                                        Sold out
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-warm-line bg-paper p-5 sm:p-6">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold tracking-[0.12em] text-brand-dark uppercase">
                                {menuItem.category?.name ?? 'Uncategorized'}
                            </span>
                            <span
                                className={`rounded-full px-2 py-0.5 text-[9.5px] font-extrabold tracking-[0.06em] uppercase ${
                                    menuItem.is_available ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                }`}
                            >
                                {menuItem.is_available ? 'Available' : 'Unavailable'}
                            </span>
                        </div>

                        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">{menuItem.name}</h1>

                        <p className="mt-3 text-sm leading-relaxed text-warm-muted">
                            {menuItem.description ?? 'Freshly prepared in our kitchen.'}
                        </p>

                        <p className="mt-5 text-3xl font-extrabold tracking-tight">{formatPeso(menuItem.price)}</p>

                        {menuItem.is_available ? (
                            canOrder ? (
                                <div className="mt-6 space-y-3">
                                    <div className="flex items-center justify-between gap-4 rounded-xl border border-warm-line p-2">
                                        <span className="pl-2 text-xs font-bold text-warm-muted">Quantity</span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                                                aria-label="Decrease quantity"
                                                className="grid size-8 place-items-center rounded-lg text-warm-muted hover:bg-warm-soft"
                                            >
                                                <Minus className="size-4" />
                                            </button>
                                            <span className="w-8 text-center text-sm font-extrabold">{quantity}</span>
                                            <button
                                                type="button"
                                                onClick={() => setQuantity((value) => Math.min(99, value + 1))}
                                                aria-label="Increase quantity"
                                                className="grid size-8 place-items-center rounded-lg text-warm-muted hover:bg-warm-soft"
                                            >
                                                <Plus className="size-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={addToCart}
                                        disabled={adding}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand/20 transition hover:bg-brand-dark disabled:opacity-60"
                                    >
                                        {adding ? <LoaderCircle className="size-4 animate-spin" /> : <ShoppingBasket className="size-4" />}
                                        Add to cart · {formatPeso(Number(menuItem.price) * quantity)}
                                    </button>
                                </div>
                            ) : auth.user ? (
                                <p className="mt-6 rounded-xl border border-warm-line bg-warm-soft px-4 py-3 text-xs font-semibold text-warm-muted">
                                    Administrator accounts can browse the storefront but cannot place customer orders.
                                </p>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3.5 text-sm font-bold text-white transition hover:bg-brand-dark"
                                >
                                    Log in to order
                                </Link>
                            )
                        ) : (
                            <p className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
                                This dish is currently unavailable. Please choose another item from the menu.
                            </p>
                        )}

                        <p className="mt-4 text-[11px] leading-relaxed text-warm-muted">
                            The price shown is the current menu price. It is checked again on the server when the order is submitted.
                        </p>
                    </div>
                </div>

                {related.length > 0 && (
                    <section className="mt-10">
                        <h2 className="font-serif text-2xl font-semibold tracking-tight">More from {menuItem.category?.name ?? 'the menu'}</h2>
                        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-4">
                            {related.map((item) => (
                                <FoodCard key={item.id} item={item} compact />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </PortalLayout>
    );
}
