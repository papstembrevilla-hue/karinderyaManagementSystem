import FoodImage from '@/components/portal/food-image';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import PortalLayout from '@/layouts/portal-layout';
import { formatPeso } from '@/lib/portal';
import { type SharedData } from '@/types';
import { type CartSummary } from '@/types/portal';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, Minus, Plus, ShoppingBasket, Trash2, UtensilsCrossed } from 'lucide-react';
import { useState } from 'react';

interface CartProps {
    cart: CartSummary;
}

export default function Cart({ cart }: CartProps) {
    const { portal } = usePage<SharedData>().props;
    const [busy, setBusy] = useState<number | null>(null);

    const updateQuantity = (id: number, quantity: number) => {
        if (quantity < 1 || quantity > 99) return;

        setBusy(id);
        router.patch(route('cart.update', id), { quantity }, { preserveScroll: true, onFinish: () => setBusy(null) });
    };

    const removeItem = (id: number) => {
        setBusy(id);
        router.delete(route('cart.destroy', id), { preserveScroll: true, onFinish: () => setBusy(null) });
    };

    const clearCart = () => {
        router.delete(route('cart.clear'), { preserveScroll: true });
    };

    if (cart.items.length === 0) {
        return (
            <PortalLayout>
                <Head title="My Cart" />
                <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="rounded-2xl border border-dashed border-[#dcc9b4] bg-paper px-6 py-14 text-center">
                        <div className="mx-auto grid size-16 place-items-center rounded-full border border-[#f0e0cc] bg-[#fbf0e3]">
                            <ShoppingBasket className="size-7 text-brand" />
                        </div>
                        <h1 className="mt-4 font-serif text-2xl font-semibold">Your cart is empty</h1>
                        <p className="mx-auto mt-1.5 max-w-md text-sm text-warm-muted">
                            Add something from the menu and it will show up here. Your cart is saved to your account.
                        </p>
                        <Link
                            href={route('menu.index')}
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-dark"
                        >
                            <UtensilsCrossed className="size-4" />
                            Browse the menu
                        </Link>
                    </div>
                </div>
            </PortalLayout>
        );
    }

    return (
        <PortalLayout>
            <Head title="My Cart" />

            <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="font-serif text-3xl font-semibold tracking-tight">Your cart</h1>
                        <p className="mt-1 text-sm text-warm-muted">
                            {cart.item_count} item{cart.item_count === 1 ? '' : 's'} · prices from the current menu
                        </p>
                    </div>
                    <Link href={route('menu.index')} className="text-xs font-extrabold text-brand-dark">
                        Add more items
                    </Link>
                </div>

                {cart.has_unavailable && (
                    <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
                        <AlertTriangle className="mt-0.5 size-4 flex-none" />
                        One or more items are no longer available. Remove them before checking out.
                    </div>
                )}

                <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_0.85fr] lg:items-start">
                    <div className="overflow-hidden rounded-2xl border border-warm-line bg-paper">
                        <div className="flex items-center justify-between border-b border-warm-line px-4 py-3.5 sm:px-5">
                            <h2 className="text-sm font-bold">Items</h2>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <button type="button" className="text-[11.5px] font-bold text-red-600 hover:text-red-700">
                                        Clear cart
                                    </button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Clear your cart?</DialogTitle>
                                        <DialogDescription>
                                            This removes every item from your cart. It does not affect past orders.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <button
                                            type="button"
                                            onClick={clearCart}
                                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
                                        >
                                            Yes, clear cart
                                        </button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {cart.items.map((item) => (
                            <div key={item.id} className="flex flex-wrap items-center gap-3 border-b border-warm-soft p-4 last:border-0 sm:px-5">
                                <div className="size-14 overflow-hidden rounded-xl">
                                    <FoodImage photo={item.photo} name={item.name} seed={item.menu_item_id} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-bold">{item.name}</p>
                                    <p className="text-[11.5px] text-warm-muted">
                                        {formatPeso(item.unit_price)} each
                                        {!item.is_available && <span className="ml-2 font-bold text-red-600">Unavailable</span>}
                                    </p>
                                </div>

                                <div className={`flex items-center gap-1 rounded-lg border border-warm-line p-0.5 ${busy === item.id ? 'opacity-50' : ''}`}>
                                    <button
                                        type="button"
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        disabled={busy === item.id || item.quantity <= 1}
                                        aria-label={`Decrease ${item.name} quantity`}
                                        className="grid size-7 place-items-center rounded-md text-warm-muted hover:bg-warm-soft disabled:opacity-40"
                                    >
                                        <Minus className="size-3.5" />
                                    </button>
                                    <span className="w-7 text-center text-xs font-extrabold">{item.quantity}</span>
                                    <button
                                        type="button"
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        disabled={busy === item.id || item.quantity >= 99}
                                        aria-label={`Increase ${item.name} quantity`}
                                        className="grid size-7 place-items-center rounded-md text-warm-muted hover:bg-warm-soft disabled:opacity-40"
                                    >
                                        <Plus className="size-3.5" />
                                    </button>
                                </div>

                                <div className="w-20 text-right text-sm font-extrabold">{formatPeso(item.line_total)}</div>

                                <button
                                    type="button"
                                    onClick={() => removeItem(item.id)}
                                    disabled={busy === item.id}
                                    aria-label={`Remove ${item.name}`}
                                    className="grid size-8 place-items-center rounded-lg text-warm-muted transition hover:bg-red-50 hover:text-red-600"
                                >
                                    <Trash2 className="size-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <aside className="rounded-2xl border border-warm-line bg-paper">
                        <div className="border-b border-warm-line px-5 py-3.5">
                            <h2 className="text-sm font-bold">Order summary</h2>
                        </div>
                        <div className="p-5">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-warm-muted">Subtotal</span>
                                <span className="font-extrabold">{formatPeso(cart.subtotal)}</span>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs text-warm-muted">
                                <span>Delivery fee</span>
                                <span>{portal.delivery_fee > 0 ? `${formatPeso(portal.delivery_fee)} for delivery` : 'Free delivery'}</span>
                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-dashed border-[#dcc9b4] pt-4">
                                <span className="text-sm font-bold">Total before delivery</span>
                                <span className="text-2xl font-extrabold tracking-tight">{formatPeso(cart.subtotal)}</span>
                            </div>

                            <Link
                                href={route('checkout.create')}
                                aria-disabled={cart.has_unavailable}
                                className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold transition ${
                                    cart.has_unavailable
                                        ? 'pointer-events-none bg-neutral-200 text-neutral-500'
                                        : 'bg-brand text-white shadow-lg shadow-brand/20 hover:bg-brand-dark'
                                }`}
                            >
                                Proceed to checkout
                                <ArrowRight className="size-4" />
                            </Link>

                            <p className="mt-3 text-[11px] leading-relaxed text-warm-muted">
                                The final total is calculated on the server. Delivery fees apply only to delivery orders.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </PortalLayout>
    );
}
