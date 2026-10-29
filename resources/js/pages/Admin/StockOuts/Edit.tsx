import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { FormEvent } from 'react';

interface StockOut {
    id: number;
    ingredient_id: number;
    quantity: string | number;
    reason: string;
    occurred_at: string;
    notes: string | null;
    ingredient: { id: number; ingredient_name: string; unit: string } | null;
}

interface Props {
    stockOut: StockOut;
    reasons: string[];
}

export default function Edit({ stockOut, reasons }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        ingredient_id: String(stockOut.ingredient_id),
        quantity: String(stockOut.quantity),
        reason: stockOut.reason,
        occurred_at: stockOut.occurred_at?.slice(0, 10) ?? '',
        notes: stockOut.notes ?? '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(`/admin/stock-outs/${stockOut.id}`);
    };

    return (
        <AppLayout>
            <Head title="Edit Stock Out" />

            <div className="mx-auto max-w-3xl space-y-6 p-6">
                <Link
                    href="/admin/stock-outs"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-rose-600"
                >
                    <ArrowLeft size={17} /> Back to Stock Out
                </Link>

                <div>
                    <h1 className="text-2xl font-bold">Edit Stock Out</h1>
                    <p className="text-sm text-gray-500">
                        Changing the quantity reconciles the ingredient balance
                        automatically.
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-5 rounded-xl border bg-white p-6 shadow-sm"
                >
                    <div>
                        <label className="mb-1.5 block text-sm font-medium">
                            Ingredient
                        </label>
                        <input
                            type="text"
                            value={
                                stockOut.ingredient
                                    ? `${stockOut.ingredient.ingredient_name} (${stockOut.ingredient.unit})`
                                    : '-'
                            }
                            disabled
                            className="w-full rounded-lg border bg-gray-50 px-3 py-2.5 text-gray-600"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            The ingredient of a historical record cannot be
                            changed.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">
                                Quantity Removed *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={data.quantity}
                                onChange={(e) =>
                                    setData('quantity', e.target.value)
                                }
                                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-rose-400"
                            />
                            {errors.quantity && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.quantity}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium">
                                Reason *
                            </label>
                            <select
                                value={data.reason}
                                onChange={(e) =>
                                    setData('reason', e.target.value)
                                }
                                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-rose-400"
                            >
                                {reasons.map((reason) => (
                                    <option key={reason} value={reason}>
                                        {reason}
                                    </option>
                                ))}
                            </select>
                            {errors.reason && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.reason}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium">
                            Date *
                        </label>
                        <input
                            type="date"
                            value={data.occurred_at}
                            onChange={(e) =>
                                setData('occurred_at', e.target.value)
                            }
                            className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-rose-400 sm:max-w-xs"
                        />
                        {errors.occurred_at && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.occurred_at}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium">
                            Notes
                        </label>
                        <textarea
                            rows={3}
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-rose-400"
                        />
                        {errors.notes && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.notes}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 border-t pt-5">
                        <Link
                            href="/admin/stock-outs"
                            className="rounded-lg border px-4 py-2.5 text-sm"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                        >
                            {processing ? 'Updating...' : 'Update Stock Out'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
