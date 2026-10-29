import StatusBadge from '@/components/portal/status-badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import PortalLayout from '@/layouts/portal-layout';
import {
    ORDER_STEPS,
    formatDateTime,
    formatPeso,
    fulfillmentLabel,
    paymentStatusLabel,
    stepLabel,
} from '@/lib/portal';
import { type OrderDetail } from '@/types/portal';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    CircleCheck,
    MapPin,
    Phone,
    RefreshCw,
    RotateCcw,
    ShoppingBasket,
    Store,
    Truck,
    XCircle,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

interface OrderShowProps {
    order: OrderDetail;
    canCancel: boolean;
    wasJustPlaced: boolean;
}

export default function OrderShow({ order, canCancel, wasJustPlaced }: OrderShowProps) {
    const [refreshing, setRefreshing] = useState(false);
    const isClosed = order.status === 'completed' || order.status === 'cancelled';

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({ reason: '' });
    const [cancelOpen, setCancelOpen] = useState(false);

    useEffect(() => {
        if (isClosed) return;

        const timer = window.setInterval(() => {
            router.reload({ only: ['order', 'canCancel'] });
        }, 30000);

        return () => window.clearInterval(timer);
    }, [isClosed]);

    const refresh = () => {
        router.reload({
            only: ['order', 'canCancel'],
            onStart: () => setRefreshing(true),
            onFinish: () => setRefreshing(false),
        });
    };

    const submitCancel = (event: FormEvent) => {
        event.preventDefault();

        post(route('orders.cancel', order.id), {
            preserveScroll: true,
            onSuccess: () => {
                setCancelOpen(false);
                reset();
            },
        });
    };

    const reorder = () => {
        router.post(route('orders.reorder', order.id), {}, { preserveScroll: true });
    };

    const activeStep = ORDER_STEPS.indexOf(order.status as (typeof ORDER_STEPS)[number]);

    return (
        <PortalLayout>
            <Head title={`Order ${order.reference}`} />

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <Link
                    href={route('orders.index')}
                    className="inline-flex items-center gap-1.5 text-[12px] font-bold text-warm-muted transition hover:text-brand-dark"
                >
                    <ArrowLeft className="size-3.5" />
                    Back to my orders
                </Link>

                {wasJustPlaced && (
                    <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5">
                        <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                        <div>
                            <p className="text-sm font-extrabold text-emerald-900">Order placed successfully</p>
                            <p className="mt-0.5 text-xs text-emerald-700">
                                The karinderya has received your order. Save your reference — {order.reference}.
                            </p>
                        </div>
                    </div>
                )}

                <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <span className="inline-flex items-center gap-2 text-[10.5px] font-extrabold tracking-[0.16em] text-brand-dark uppercase">
                            <span className="size-1.5 rounded-full bg-brand" />
                            Order tracking
                        </span>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
                            <h1 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">{order.reference}</h1>
                            <StatusBadge status={order.status} fulfillment={order.fulfillment_method} />
                        </div>
                        <p className="mt-1 text-xs text-warm-muted">Placed {formatDateTime(order.created_at)}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={refresh}
                            disabled={refreshing}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-warm-line bg-paper px-3 py-2 text-[11.5px] font-bold transition hover:border-brand disabled:opacity-60"
                        >
                            <RefreshCw className={`size-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            type="button"
                            onClick={reorder}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-[11.5px] font-bold text-white transition hover:bg-brand-dark"
                        >
                            <RotateCcw className="size-3.5" />
                            Reorder
                        </button>
                    </div>
                </div>

                <div className="mt-6 rounded-2xl border border-warm-line bg-paper p-4 sm:p-5">
                    {order.status === 'cancelled' ? (
                        <div className="flex items-start gap-3">
                            <XCircle className="mt-0.5 size-5 shrink-0 text-red-500" />
                            <div>
                                <p className="text-sm font-extrabold text-red-700">This order was cancelled</p>
                                <p className="mt-0.5 text-xs text-warm-muted">
                                    {order.cancellation_reason ? `Reason: ${order.cancellation_reason}` : 'No reason was recorded.'}
                                </p>
                                {order.cancelled_at && (
                                    <p className="mt-1 text-[11px] text-warm-muted">Cancelled {formatDateTime(order.cancelled_at)}</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            <ol className="flex items-start justify-between gap-1">
                                {ORDER_STEPS.map((step, index) => {
                                    const done = activeStep >= index;
                                    const current = activeStep === index;

                                    return (
                                        <li key={step} className="flex flex-1 flex-col items-center gap-2 text-center">
                                            <div className="flex w-full items-center">
                                                <span
                                                    className={`h-0.5 flex-1 ${index === 0 ? 'opacity-0' : done ? 'bg-brand' : 'bg-[#ecdfd1]'}`}
                                                />
                                                <span
                                                    className={`grid size-8 shrink-0 place-items-center rounded-full border-2 transition ${
                                                        done
                                                            ? 'border-brand bg-brand text-white'
                                                            : 'border-[#e2d3c1] bg-paper text-[#bda893]'
                                                    }`}
                                                >
                                                    {activeStep > index ? <Check className="size-4" /> : <span className="text-[11px] font-extrabold">{index + 1}</span>}
                                                </span>
                                                <span
                                                    className={`h-0.5 flex-1 ${
                                                        index === ORDER_STEPS.length - 1 ? 'opacity-0' : activeStep > index ? 'bg-brand' : 'bg-[#ecdfd1]'
                                                    }`}
                                                />
                                            </div>
                                            <span
                                                className={`text-[10.5px] font-bold leading-tight ${
                                                    current ? 'text-brand-dark' : done ? 'text-ink' : 'text-[#b3a08e]'
                                                }`}
                                            >
                                                {stepLabel(step, order.fulfillment_method)}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ol>
                            <p className="mt-3 text-center text-[11px] text-warm-muted">
                                This page refreshes automatically every 30 seconds while your order is in progress.
                            </p>
                        </>
                    )}
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
                    <div className="rounded-2xl border border-warm-line bg-paper">
                        <div className="flex items-center justify-between border-b border-warm-soft px-4 py-3">
                            <h2 className="text-sm font-extrabold">Ordered items</h2>
                            <Link href={route('menu.index')} className="text-[11.5px] font-bold text-brand-dark hover:underline">
                                Order again
                            </Link>
                        </div>

                        <ul className="divide-y divide-warm-soft">
                            {order.items.map((item) => (
                                <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-[13px] font-bold">{item.item_name}</p>
                                        <p className="text-[11px] text-warm-muted">
                                            {formatPeso(item.unit_price)} × {item.quantity}
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-sm font-extrabold">{formatPeso(item.line_total)}</span>
                                </li>
                            ))}
                        </ul>

                        <dl className="space-y-1.5 border-t border-warm-soft px-4 py-3.5 text-[12.5px]">
                            <div className="flex justify-between">
                                <dt className="text-warm-muted">Subtotal</dt>
                                <dd className="font-semibold">{formatPeso(order.subtotal)}</dd>
                            </div>
                            {Number(order.delivery_fee) > 0 && (
                                <div className="flex justify-between">
                                    <dt className="text-warm-muted">Delivery fee</dt>
                                    <dd className="font-semibold">{formatPeso(order.delivery_fee)}</dd>
                                </div>
                            )}
                            {Number(order.discount) > 0 && (
                                <div className="flex justify-between">
                                    <dt className="text-warm-muted">Discount</dt>
                                    <dd className="font-semibold text-emerald-700">-{formatPeso(order.discount)}</dd>
                                </div>
                            )}
                            <div className="flex justify-between border-t border-dashed border-[#e7d7c6] pt-2 text-sm">
                                <dt className="font-extrabold">Total</dt>
                                <dd className="font-extrabold">{formatPeso(order.total)}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-2xl border border-warm-line bg-paper p-4">
                            <h2 className="text-sm font-extrabold">{fulfillmentLabel(order.fulfillment_method)} details</h2>
                            <div className="mt-2.5 space-y-2 text-[12px]">
                                <div className="flex items-start gap-2">
                                    {order.fulfillment_method === 'delivery' ? (
                                        <Truck className="mt-0.5 size-3.5 shrink-0 text-brand" />
                                    ) : (
                                        <Store className="mt-0.5 size-3.5 shrink-0 text-brand" />
                                    )}
                                    <span className="text-warm-muted">
                                        {order.fulfillment_method === 'delivery'
                                            ? 'Your order will be delivered to the address below.'
                                            : 'Pick up your order at the karinderya once it is ready.'}
                                    </span>
                                </div>
                                {order.recipient_name && (
                                    <p className="font-bold text-ink">{order.recipient_name}</p>
                                )}
                                {order.contact_phone && (
                                    <p className="flex items-center gap-1.5 text-warm-muted">
                                        <Phone className="size-3.5 shrink-0 text-brand" />
                                        {order.contact_phone}
                                    </p>
                                )}
                                {order.delivery_address && (
                                    <p className="flex items-start gap-1.5 text-warm-muted">
                                        <MapPin className="mt-0.5 size-3.5 shrink-0 text-brand" />
                                        {order.delivery_address}
                                    </p>
                                )}
                                {order.notes && (
                                    <p className="rounded-lg bg-warm-soft px-2.5 py-2 text-[11.5px] text-[#6b5747]">
                                        Note: {order.notes}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-warm-line bg-paper p-4">
                            <h2 className="text-sm font-extrabold">Payment</h2>
                            <dl className="mt-2.5 space-y-1.5 text-[12px]">
                                <div className="flex justify-between">
                                    <dt className="text-warm-muted">Method</dt>
                                    <dd className="font-semibold">{order.payment_method === 'gcash' ? 'GCash' : 'Cash'}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-warm-muted">Status</dt>
                                    <dd className="font-semibold">{paymentStatusLabel(order.payment_status)}</dd>
                                </div>
                            </dl>
                            <p className="mt-2 text-[11px] text-warm-muted">
                                No online payment is processed here. Payment status is updated by the karinderya staff.
                            </p>
                        </div>

                        {canCancel && (
                            <Dialog
                                open={cancelOpen}
                                onOpenChange={(open) => {
                                    setCancelOpen(open);
                                    if (!open) {
                                        clearErrors();
                                        reset();
                                    }
                                }}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    >
                                        <XCircle className="mr-2 size-4" />
                                        Request cancellation
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogTitle>Cancel this order?</DialogTitle>
                                    <DialogDescription>
                                        You can cancel an order while it is still pending. The karinderya will see your reason and the
                                        order remains in your history.
                                    </DialogDescription>

                                    <form onSubmit={submitCancel} className="space-y-3">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="cancel-reason">Reason</Label>
                                            <textarea
                                                id="cancel-reason"
                                                value={data.reason}
                                                onChange={(event) => setData('reason', event.target.value)}
                                                rows={3}
                                                maxLength={500}
                                                required
                                                placeholder="Why do you need to cancel?"
                                                className="w-full rounded-lg border border-warm-line bg-paper px-3 py-2 text-sm outline-none focus:border-brand"
                                            />
                                            {errors.reason && <p className="text-xs font-medium text-red-600">{errors.reason}</p>}
                                        </div>
                                        <DialogFooter>
                                            <Button type="button" variant="secondary" onClick={() => setCancelOpen(false)}>
                                                Keep order
                                            </Button>
                                            <Button type="submit" variant="destructive" disabled={processing}>
                                                Submit request
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}

                        <Link
                            href={route('cart.index')}
                            className="flex items-center justify-center gap-2 rounded-xl border border-warm-line bg-paper px-4 py-2.5 text-[12px] font-bold text-warm-muted transition hover:border-brand hover:text-brand-dark"
                        >
                            <ShoppingBasket className="size-4" />
                            View my cart
                        </Link>
                    </div>
                </div>

                <div className="mt-5 rounded-2xl border border-warm-line bg-paper p-4 sm:p-5">
                    <h2 className="text-sm font-extrabold">Status history</h2>
                    {order.status_histories.length === 0 ? (
                        <p className="mt-2 text-xs text-warm-muted">No status updates have been recorded yet.</p>
                    ) : (
                        <ol className="mt-3 space-y-3">
                            {order.status_histories.map((history) => (
                                <li key={history.id} className="flex gap-3">
                                    <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full border border-warm-line bg-warm-soft">
                                        <span className="size-1.5 rounded-full bg-brand" />
                                    </span>
                                    <div>
                                        <p className="text-[12.5px] font-bold capitalize">
                                            {history.status === 'ready'
                                                ? stepLabel(history.status, order.fulfillment_method)
                                                : history.status}
                                        </p>
                                        <p className="text-[11px] text-warm-muted">
                                            {formatDateTime(history.created_at)}
                                            {history.changed_by_user ? ` · by ${history.changed_by_user.name}` : ''}
                                        </p>
                                        {history.note && <p className="mt-0.5 text-[11.5px] text-[#6b5747]">{history.note}</p>}
                                    </div>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            </div>
        </PortalLayout>
    );
}
