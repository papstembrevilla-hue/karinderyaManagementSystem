import FoodImage from '@/components/portal/food-image';
import InputError from '@/components/input-error';
import PortalLayout from '@/layouts/portal-layout';
import { formatPeso } from '@/lib/portal';
import { type SharedData } from '@/types';
import { type Address, type CartSummary } from '@/types/portal';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Banknote, LoaderCircle, MapPin, Smartphone, Store, Truck } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

interface CheckoutProps {
    cart: CartSummary;
    addresses: Address[];
    checkoutToken: string;
}

type CheckoutForm = {
    checkout_token: string;
    fulfillment_method: string;
    payment_method: string;
    address_id: number | null;
    recipient_name: string;
    contact_phone: string;
    delivery_address: string;
    notes: string;
};

export default function Checkout({ cart, addresses, checkoutToken }: CheckoutProps) {
    const { portal, auth } = usePage<SharedData>().props;

    const defaultAddress = addresses.find((address) => address.is_default) ?? addresses[0] ?? null;
    const [savedAddressId, setSavedAddressId] = useState<number | ''>(defaultAddress?.id ?? '');
    const [manualAddress, setManualAddress] = useState(addresses.length === 0);

    const initialAddressId: number | null = defaultAddress?.id ?? null;

    const form = useForm<CheckoutForm>({
        checkout_token: checkoutToken,
        fulfillment_method: 'pickup',
        payment_method: portal.payment_methods[0] ?? 'cash',
        address_id: initialAddressId,
        recipient_name: defaultAddress?.recipient_name ?? auth.user?.name ?? '',
        contact_phone: defaultAddress?.phone ?? auth.user?.phone ?? '',
        delivery_address: defaultAddress?.address ?? '',
        notes: '',
    });

    const isDelivery = form.data.fulfillment_method === 'delivery';
    const deliveryFee = isDelivery ? Number(portal.delivery_fee ?? 0) : 0;
    const total = useMemo(() => Number(cart.subtotal) + deliveryFee, [cart.subtotal, deliveryFee]);
    const formErrors = form.errors as Record<string, string | undefined>;

    const selectFulfillment = (method: string) => {
        form.setData('fulfillment_method', method);

        if (method === 'pickup') {
            form.setData('address_id', null);
        } else if (savedAddressId !== '' && !manualAddress) {
            form.setData('address_id', Number(savedAddressId));
        }
    };

    const selectSavedAddress = (value: string) => {
        if (value === '') {
            setSavedAddressId('');
            setManualAddress(true);
            form.setData('address_id', null);
            form.setData('recipient_name', auth.user?.name ?? '');
            form.setData('contact_phone', auth.user?.phone ?? '');
            form.setData('delivery_address', '');

            return;
        }

        const address = addresses.find((entry) => String(entry.id) === value);

        if (!address) return;

        setSavedAddressId(address.id);
        setManualAddress(false);
        form.setData('address_id', address.id);
        form.setData('recipient_name', address.recipient_name);
        form.setData('contact_phone', address.phone);
        form.setData('delivery_address', address.address);
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(route('checkout.store'), { preserveScroll: true });
    };

    return (
        <PortalLayout>
            <Head title="Checkout" />

            <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
                <Link href={route('cart.index')} className="inline-flex items-center gap-1.5 text-xs font-bold text-warm-muted hover:text-ink">
                    <ArrowLeft className="size-3.5" />
                    Back to cart
                </Link>

                <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="font-serif text-3xl font-semibold tracking-tight">Checkout</h1>
                        <p className="mt-1 text-sm text-warm-muted">Review your order, choose how to receive it, then place it.</p>
                    </div>
                    <span className="rounded-full border border-warm-line bg-paper px-3 py-1 text-[10.5px] font-extrabold tracking-[0.06em] text-warm-muted uppercase">
                        {cart.item_count} item{cart.item_count === 1 ? '' : 's'}
                    </span>
                </div>

                <form onSubmit={submit} className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_0.85fr] lg:items-start">
                    <div className="space-y-4">
                        <section className="rounded-2xl border border-warm-line bg-paper p-5">
                            <h2 className="text-sm font-bold">How would you like your order?</h2>

                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => selectFulfillment('pickup')}
                                    className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                                        !isDelivery ? 'border-brand bg-[#fff4eb]' : 'border-warm-line hover:border-[#dfc7b0]'
                                    }`}
                                >
                                    <Store className={`mt-0.5 size-5 ${!isDelivery ? 'text-brand' : 'text-warm-muted'}`} />
                                    <span>
                                        <span className="block text-sm font-bold">Pickup</span>
                                        <span className="block text-[11.5px] text-warm-muted">Collect from the store</span>
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => selectFulfillment('delivery')}
                                    className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                                        isDelivery ? 'border-brand bg-[#fff4eb]' : 'border-warm-line hover:border-[#dfc7b0]'
                                    }`}
                                >
                                    <Truck className={`mt-0.5 size-5 ${isDelivery ? 'text-brand' : 'text-warm-muted'}`} />
                                    <span>
                                        <span className="block text-sm font-bold">Delivery</span>
                                        <span className="block text-[11.5px] text-warm-muted">
                                            {portal.delivery_fee > 0 ? `${formatPeso(portal.delivery_fee)} delivery fee` : 'Within the store area'}
                                        </span>
                                    </span>
                                </button>
                            </div>

                            {isDelivery && (
                                <div className="mt-4 space-y-3 border-t border-warm-soft pt-4">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-bold text-warm-muted">Delivery address</span>
                                        <Link href={route('portal.addresses.index')} className="text-[11px] font-extrabold text-brand-dark">
                                            Manage addresses
                                        </Link>
                                    </div>

                                    {addresses.length > 0 && (
                                        <select
                                            value={savedAddressId === '' ? '' : String(savedAddressId)}
                                            onChange={(event) => selectSavedAddress(event.target.value)}
                                            className="w-full rounded-lg border border-warm-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brand"
                                        >
                                            {addresses.map((address) => (
                                                <option key={address.id} value={address.id}>
                                                    {address.label} — {address.address}
                                                </option>
                                            ))}
                                            <option value="">Enter a different address</option>
                                        </select>
                                    )}

                                    <div className="grid gap-2 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="recipient_name" className="mb-1 block text-[10.5px] font-extrabold tracking-[0.08em] text-warm-muted uppercase">
                                                Recipient name
                                            </label>
                                            <input
                                                id="recipient_name"
                                                value={form.data.recipient_name}
                                                onChange={(event) => form.setData('recipient_name', event.target.value)}
                                                readOnly={!manualAddress}
                                                className={`w-full rounded-lg border border-warm-line px-3 py-2.5 text-sm outline-none focus:border-brand ${
                                                    manualAddress ? 'bg-white' : 'bg-warm-soft text-warm-muted'
                                                }`}
                                                autoComplete="name"
                                            />
                                            <InputError message={form.errors.recipient_name} className="mt-1" />
                                        </div>

                                        <div>
                                            <label htmlFor="contact_phone" className="mb-1 block text-[10.5px] font-extrabold tracking-[0.08em] text-warm-muted uppercase">
                                                Contact number
                                            </label>
                                            <input
                                                id="contact_phone"
                                                value={form.data.contact_phone}
                                                onChange={(event) => form.setData('contact_phone', event.target.value)}
                                                readOnly={!manualAddress}
                                                className={`w-full rounded-lg border border-warm-line px-3 py-2.5 text-sm outline-none focus:border-brand ${
                                                    manualAddress ? 'bg-white' : 'bg-warm-soft text-warm-muted'
                                                }`}
                                                autoComplete="tel"
                                            />
                                            <InputError message={form.errors.contact_phone} className="mt-1" />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="delivery_address" className="mb-1 block text-[10.5px] font-extrabold tracking-[0.08em] text-warm-muted uppercase">
                                            Complete address
                                        </label>
                                        <textarea
                                            id="delivery_address"
                                            rows={2}
                                            value={form.data.delivery_address}
                                            onChange={(event) => form.setData('delivery_address', event.target.value)}
                                            readOnly={!manualAddress}
                                            className={`w-full rounded-lg border border-warm-line px-3 py-2.5 text-sm outline-none focus:border-brand ${
                                                manualAddress ? 'bg-white' : 'bg-warm-soft text-warm-muted'
                                            }`}
                                        />
                                        <InputError message={form.errors.delivery_address} className="mt-1" />
                                    </div>
                                </div>
                            )}

                            {!isDelivery && (
                                <div className="mt-4 border-t border-warm-soft pt-4">
                                    <label htmlFor="pickup_phone" className="mb-1 block text-[10.5px] font-extrabold tracking-[0.08em] text-warm-muted uppercase">
                                        Contact number
                                    </label>
                                    <input
                                        id="pickup_phone"
                                        value={form.data.contact_phone}
                                        onChange={(event) => form.setData('contact_phone', event.target.value)}
                                        className="w-full rounded-lg border border-warm-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brand"
                                        autoComplete="tel"
                                    />
                                    <InputError message={form.errors.contact_phone} className="mt-1" />
                                </div>
                            )}
                        </section>

                        <section className="rounded-2xl border border-warm-line bg-paper p-5">
                            <h2 className="text-sm font-bold">Payment method</h2>
                            <p className="mt-1 text-[11.5px] text-warm-muted">
                                No online payment gateway is connected. Staff confirm payment when you receive the order.
                            </p>

                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                {(portal.payment_methods.length > 0 ? portal.payment_methods : ['cash']).map((method) => {
                                    const active = form.data.payment_method === method;
                                    const Icon = method === 'gcash' ? Smartphone : Banknote;

                                    return (
                                        <button
                                            key={method}
                                            type="button"
                                            onClick={() => form.setData('payment_method', method)}
                                            className={`flex items-center gap-2.5 rounded-xl border p-3.5 text-left transition ${
                                                active ? 'border-brand bg-[#fff4eb]' : 'border-warm-line hover:border-[#dfc7b0]'
                                            }`}
                                        >
                                            <Icon className={`size-4.5 ${active ? 'text-brand' : 'text-warm-muted'}`} />
                                            <span className="text-sm font-bold">{method === 'gcash' ? 'GCash' : 'Cash'}</span>
                                            <span
                                                className={`ml-auto size-3.5 rounded-full border ${
                                                    active ? 'border-brand bg-brand shadow-[inset_0_0_0_2.5px_white]' : 'border-[#c9b7a6]'
                                                }`}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                            <InputError message={form.errors.payment_method} className="mt-2" />
                        </section>

                        <section className="rounded-2xl border border-warm-line bg-paper p-5">
                            <label htmlFor="notes" className="text-sm font-bold">
                                Notes for the kitchen
                            </label>
                            <p className="mt-0.5 text-[11.5px] text-warm-muted">Optional. Allergies, packaging, or delivery instructions.</p>
                            <textarea
                                id="notes"
                                rows={3}
                                maxLength={1000}
                                value={form.data.notes}
                                onChange={(event) => form.setData('notes', event.target.value)}
                                placeholder="e.g. Less spicy, please."
                                className="mt-2 w-full rounded-lg border border-warm-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brand"
                            />
                            <InputError message={form.errors.notes} className="mt-1" />
                        </section>
                    </div>

                    <aside className="overflow-hidden rounded-2xl border border-warm-line bg-paper lg:sticky lg:top-20">
                        <div className="border-b border-warm-line px-5 py-3.5">
                            <h2 className="text-sm font-bold">Your order</h2>
                        </div>

                        <div className="max-h-72 overflow-y-auto">
                            {cart.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 border-b border-warm-soft px-5 py-3 last:border-0">
                                    <div className="size-9 overflow-hidden rounded-lg">
                                        <FoodImage photo={item.photo} name={item.name} seed={item.menu_item_id} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-bold">{item.name}</p>
                                        <p className="text-[10.5px] text-warm-muted">
                                            {item.quantity} × {formatPeso(item.unit_price)}
                                        </p>
                                    </div>
                                    <span className="text-xs font-extrabold">{formatPeso(item.line_total)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-warm-line p-5">
                            <div className="flex items-center justify-between text-sm text-warm-muted">
                                <span>Subtotal</span>
                                <span className="font-bold text-ink">{formatPeso(cart.subtotal)}</span>
                            </div>
                            <div className="mt-1.5 flex items-center justify-between text-sm text-warm-muted">
                                <span>Delivery fee</span>
                                <span className="font-bold text-ink">{formatPeso(deliveryFee)}</span>
                            </div>
                            <div className="mt-1.5 flex items-center justify-between text-sm text-warm-muted">
                                <span>Discount</span>
                                <span className="font-bold text-ink">₱0.00</span>
                            </div>

                            <div className="mt-3 flex items-center justify-between border-t border-dashed border-[#dcc9b4] pt-3">
                                <span className="text-sm font-bold">Total</span>
                                <span className="text-2xl font-extrabold tracking-tight">{formatPeso(total)}</span>
                            </div>

                            {cart.has_unavailable && (
                                <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-800">
                                    <AlertTriangle className="mt-0.5 size-3.5 flex-none" />
                                    Some items are unavailable. Remove them in your cart first.
                                </div>
                            )}

                            <InputError message={formErrors.cart} className="mt-2" />
                            <InputError message={form.errors.checkout_token} className="mt-2" />

                            <button
                                type="submit"
                                disabled={form.processing || cart.has_unavailable}
                                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand/20 transition hover:bg-brand-dark disabled:opacity-50"
                            >
                                {form.processing ? <LoaderCircle className="size-4 animate-spin" /> : <MapPin className="size-4" />}
                                Place order · {formatPeso(total)}
                            </button>

                            <p className="mt-3 text-[10.5px] leading-relaxed text-warm-muted">
                                One order is created per confirmed checkout. Prices, availability, and fees are verified on the server before the order is saved.
                            </p>
                        </div>
                    </aside>
                </form>
            </div>
        </PortalLayout>
    );
}
