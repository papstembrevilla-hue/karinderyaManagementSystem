import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { FormEvent, useMemo } from 'react';

interface Ingredient {
    id: number;
    ingredient_name: string;
    unit: string;
    quantity: string | number;
}

interface Props {
    ingredients: Ingredient[];
    reasons: string[];
}

export default function Create({ ingredients, reasons }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        ingredient_id: '',
        quantity: '',
        reason: '',
        occurred_at: new Date().toISOString().slice(0, 10),
        notes: '',
    });

    const selected = useMemo(
        () => ingredients.find((item) => String(item.id) === data.ingredient_id),
        [ingredients, data.ingredient_id],
    );

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/stock-outs');
    };

    return (
        <AppLayout>
            <Head title="Record Stock Out" />

            <div className="mx-auto max-w-3xl space-y-6 p-6">
                <Link
                    href="/admin/stock-outs"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-rose-600"
                >
                    <ArrowLeft size={17} /> Back to Stock Out
                </Link>

                <div>
                    <h1 className="text-2xl font-bold">Record Stock Out</h1>
                    <p className="text-sm text-gray-500">
                        Removing stock decreases the selected ingredient&apos;s
                        quantity.
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-5 rounded-xl border bg-white p-6 shadow-sm"
                >
                    <div>
                        <label className="mb-1.5 block text-sm font-medium">
                            Ingredient *
                        </label>
                        <select
                            value={data.ingredient_id}
                            onChange={(e) =>
                                setData('ingredient_id', e.target.value)
                            }
                            className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-rose-400"
                        >
                            <option value="">Select an ingredient</option>
                            {ingredients.map((ingredient) => (
                                <option
                                    key={ingredient.id}
                                    value={ingredient.id}
                                >
                                    {ingredient.ingredient_name} —{' '}
                                    {ingredient.quantity} {ingredient.unit} on
                                    hand
                                </option>
                            ))}
                        </select>
                        {selected && (
                            <p className="mt-1 text-xs text-gray-500">
                                Available: {selected.quantity} {selected.unit}
                            </p>
                        )}
                        {errors.ingredient_id && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.ingredient_id}
                            </p>
                        )}
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
                                <option value="">Select a reason</option>
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
                            {processing ? 'Saving...' : 'Save Stock Out'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
