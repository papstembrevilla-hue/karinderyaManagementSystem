import FlashMessage from '@/components/FlashMessage';
import StatusBadge from '@/components/portal/status-badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import {
    formatDateTime,
    formatPeso,
    fulfillmentLabel,
    paymentStatusLabel,
    stepLabel,
} from '@/lib/portal';
import { type OrderDetail } from '@/types/portal';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { FormEvent } from 'react';

interface OrderShowProps {
    order: OrderDetail;
    nextStatuses: string[];
}

export default function Show({ order, nextStatuses }: OrderShowProps) {
    const statusForm = useForm({
        status: nextStatuses[0] ?? '',
        note: '',
        cancellation_reason: '',
    });

    const paymentForm = useForm({
        payment_status: order.payment_status,
        payment_reference: '',
    });

    const submitStatus = (event: FormEvent) => {
        event.preventDefault();
        statusForm.patch(route('admin.orders.status', order.id), {
            preserveScroll: true,
            onSuccess: () => statusForm.reset('note', 'cancellation_reason'),
        });
    };

    const submitPayment = (event: FormEvent) => {
        event.preventDefault();
        paymentForm.patch(route('admin.orders.payment', order.id), { preserveScroll: true });
    };

    return (
        <AppLayout>
            <Head title={`Order ${order.reference}`} />
            <FlashMessage />

            <div className="p-6">
                <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
                    <ArrowLeft size={15} />
                    Back to orders
                </Link>

                <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-bold">{order.reference}</h1>
                            <StatusBadge status={order.status} fulfillment={order.fulfillment_method} />
                        </div>
                        <p className="text-gray-500">Placed {formatDateTime(order.created_at)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs tracking-wide text-gray-500 uppercase">Order total</p>
                        <p className="text-2xl font-bold">{formatPeso(order.total)}</p>
                    </div>
                </div>

                {order.status === 'cancelled' && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                        <p className="font-semibold">Cancelled {formatDateTime(order.cancelled_at)}</p>
                        <p>{order.cancellation_reason ?? 'No reason recorded.'}</p>
                    </div>
                )}

                <div className="mt-5 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
                    <div className="space-y-5">
                        <section className="overflow-hidden rounded-xl border bg-white">
                            <h2 className="border-b px-4 py-3 font-semibold">Items</h2>
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-xs tracking-wide text-gray-500 uppercase">
                                    <tr>
                                        <th className="px-4 py-2.5">Item</th>
                                        <th className="px-4 py-2.5 text-right">Price</th>
                                        <th className="px-4 py-2.5 text-right">Qty</th>
                                        <th className="px-4 py-2.5 text-right">Line total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {order.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-2.5 font-medium">{item.item_name}</td>
                                            <td className="px-4 py-2.5 text-right text-gray-600">{formatPeso(item.unit_price)}</td>
                                            <td className="px-4 py-2.5 text-right">{item.quantity}</td>
                                            <td className="px-4 py-2.5 text-right font-semibold">{formatPeso(item.line_total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <dl className="space-y-1.5 border-t px-4 py-3 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Subtotal</dt>
                                    <dd>{formatPeso(order.subtotal)}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Delivery fee</dt>
                                    <dd>{formatPeso(order.delivery_fee)}</dd>
                                </div>
                                {Number(order.discount) > 0 && (
                                    <div className="flex justify-between">
                                        <dt className="text-gray-500">Discount</dt>
                                        <dd>-{formatPeso(order.discount)}</dd>
                                    </div>
                                )}
                                <div className="flex justify-between border-t pt-2 font-bold">
                                    <dt>Total</dt>
                                    <dd>{formatPeso(order.total)}</dd>
                                </div>
                            </dl>
                        </section>

                        <section className="rounded-xl border bg-white p-4">
                            <h2 className="font-semibold">Customer & fulfillment</h2>
                            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                                <div>
                                    <dt className="text-xs text-gray-500">Account</dt>
                                    <dd className="font-medium">{order.user?.name ?? '—'}</dd>
                                    <dd className="text-gray-600">{order.user?.email ?? '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-gray-500">Recipient</dt>
                                    <dd className="font-medium">{order.recipient_name ?? '—'}</dd>
                                    <dd className="text-gray-600">{order.contact_phone ?? order.user?.phone ?? '—'}</dd>
                                </div>
                                <div className="sm:col-span-2">
                                    <dt className="text-xs text-gray-500">Method</dt>
                                    <dd className="font-medium">{fulfillmentLabel(order.fulfillment_method)}</dd>
                                </div>
                                {order.delivery_address && (
                                    <div className="sm:col-span-2">
                                        <dt className="text-xs text-gray-500">Delivery address</dt>
                                        <dd>{order.delivery_address}</dd>
                                    </div>
                                )}
                                {order.notes && (
                                    <div className="sm:col-span-2">
                                        <dt className="text-xs text-gray-500">Customer note</dt>
                                        <dd className="rounded-lg bg-gray-50 px-3 py-2">{order.notes}</dd>
                                    </div>
                                )}
                            </dl>
                        </section>

                        <section className="rounded-xl border bg-white p-4">
                            <h2 className="font-semibold">Status history</h2>
                            {order.status_histories.length === 0 ? (
                                <p className="mt-2 text-sm text-gray-500">No history recorded.</p>
                            ) : (
                                <ol className="mt-3 space-y-3">
                                    {order.status_histories.map((history) => (
                                        <li key={history.id} className="flex gap-3 text-sm">
                                            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-emerald-500" />
                                            <div>
                                                <p className="font-medium capitalize">
                                                    {history.status === 'ready'
                                                        ? stepLabel(history.status, order.fulfillment_method)
                                                        : history.status}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatDateTime(history.created_at)}
                                                    {history.changed_by_user ? ` · by ${history.changed_by_user.name}` : ' · by customer'}
                                                </p>
                                                {history.note && <p className="text-gray-600">{history.note}</p>}
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </section>
                    </div>

                    <div className="space-y-5">
                        <section className="rounded-xl border bg-white p-4">
                            <h2 className="font-semibold">Update status</h2>
                            {nextStatuses.length === 0 ? (
                                <p className="mt-2 text-sm text-gray-500">This order is in a final state and cannot move further.</p>
                            ) : (
                                <form onSubmit={submitStatus} className="mt-3 space-y-3">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="status">New status</Label>
                                        <select
                                            id="status"
                                            value={statusForm.data.status}
                                            onChange={(event) => statusForm.setData('status', event.target.value)}
                                            className="rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
                                        >
                                            {nextStatuses.map((status) => (
                                                <option key={status} value={status}>
                                                    {status === 'ready'
                                                        ? stepLabel(status, order.fulfillment_method)
                                                        : status.charAt(0).toUpperCase() + status.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                        {statusForm.errors.status && (
                                            <p className="text-xs text-red-600">{statusForm.errors.status}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="note">Note (optional)</Label>
                                        <Input
                                            id="note"
                                            value={statusForm.data.note}
                                            onChange={(event) => statusForm.setData('note', event.target.value)}
                                            placeholder="Visible to the customer"
                                            maxLength={255}
                                        />
                                        {statusForm.errors.note && <p className="text-xs text-red-600">{statusForm.errors.note}</p>}
                                    </div>

                                    {statusForm.data.status === 'cancelled' && (
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="cancellation_reason">Cancellation reason</Label>
                                            <textarea
                                                id="cancellation_reason"
                                                value={statusForm.data.cancellation_reason}
                                                onChange={(event) => statusForm.setData('cancellation_reason', event.target.value)}
                                                rows={2}
                                                maxLength={500}
                                                className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald-400"
                                            />
                                            {statusForm.errors.cancellation_reason && (
                                                <p className="text-xs text-red-600">{statusForm.errors.cancellation_reason}</p>
                                            )}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={statusForm.processing}
                                        className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                                    >
                                        {statusForm.processing ? 'Updating…' : 'Save status'}
                                    </button>
                                </form>
                            )}
                        </section>

                        <section className="rounded-xl border bg-white p-4">
                            <h2 className="font-semibold">Payment</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                {order.payment_method === 'gcash' ? 'GCash' : 'Cash'} · {paymentStatusLabel(order.payment_status)}
                            </p>
                            {order.payment_reference && (
                                <p className="mt-1 text-xs text-gray-500">Reference: {order.payment_reference}</p>
                            )}

                            <form onSubmit={submitPayment} className="mt-3 space-y-3">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="payment_status">Payment status</Label>
                                    <select
                                        id="payment_status"
                                        value={paymentForm.data.payment_status}
                                        onChange={(event) => paymentForm.setData('payment_status', event.target.value)}
                                        className="rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
                                    >
                                        <option value="unpaid">Unpaid</option>
                                        <option value="paid">Paid</option>
                                    </select>
                                    {paymentForm.errors.payment_status && (
                                        <p className="text-xs text-red-600">{paymentForm.errors.payment_status}</p>
                                    )}
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="payment_reference">Reference (optional)</Label>
                                    <Input
                                        id="payment_reference"
                                        value={paymentForm.data.payment_reference}
                                        onChange={(event) => paymentForm.setData('payment_reference', event.target.value)}
                                        placeholder="GCash reference number"
                                        maxLength={100}
                                    />
                                    {paymentForm.errors.payment_reference && (
                                        <p className="text-xs text-red-600">{paymentForm.errors.payment_reference}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={paymentForm.processing}
                                    className="w-full rounded-lg border px-4 py-2.5 text-sm font-semibold hover:border-emerald-500 disabled:opacity-60"
                                >
                                    {paymentForm.processing ? 'Saving…' : 'Update payment'}
                                </button>
                                <p className="text-xs text-gray-500">
                                    Only mark as paid once payment has actually been received.
                                </p>
                            </form>
                        </section>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
