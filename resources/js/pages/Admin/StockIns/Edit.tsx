import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { FormEvent, useMemo } from 'react';

interface StockIn {
    id: number;
    ingredient_id: number;
    supplier_id: number | null;
    quantity: string | number;
    unit_cost: string | number;
    total_cost: string | number;
    received_at: string;
    notes: string | null;
    ingredient: { id: number; ingredient_name: string; unit: string } | null;
}

interface Supplier {
    id: number;
    name: string;
}

interface Props {
    stockIn: StockIn;
    suppliers: Supplier[];
}

export default function Edit({ stockIn, suppliers }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        ingredient_id: String(stockIn.ingredient_id),
        supplier_id: stockIn.supplier_id ? String(stockIn.supplier_id) : '',
        quantity: String(stockIn.quantity),
        unit_cost: String(stockIn.unit_cost),
        received_at: stockIn.received_at?.slice(0, 10) ?? '',
        notes: stockIn.notes ?? '',
    });

    const totalCost = useMemo(
        () => Number(data.quantity || 0) * Number(data.unit_cost || 0),
        [data.quantity, data.unit_cost],
    );

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(`/admin/stock-ins/${stockIn.id}`);
    };

    return (
        <AppLayout>
            <Head title="Edit Stock In" />

            <div className="mx-auto max-w-3xl space-y-6 p-6">
                <Link
                    href="/admin/stock-ins"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                >
                    <ArrowLeft size={17} /> Back to Stock In
                </Link>

                <div>
                    <h1 className="text-2xl font-bold">Edit Stock In</h1>
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
                                stockIn.ingredient
                                    ? `${stockIn.ingredient.ingredient_name} (${stockIn.ingredient.unit})`
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
                                Quantity Received *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={data.quantity}
                                onChange={(e) =>
                                    setData('quantity', e.target.value)
                                }
                                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-blue-400"
                            />
                            {errors.quantity && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.quantity}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium">
                                Unit Cost (₱) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.unit_cost}
                                onChange={(e) =>
                                    setData('unit_cost', e.target.value)
                                }
                                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-blue-400"
                            />
                            {errors.unit_cost && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.unit_cost}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm">
                        <span className="text-gray-500">Total cost: </span>
                        <span className="font-semibold">
                            ₱{totalCost.toFixed(2)}
                        </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">
                                Supplier
                            </label>
                            <select
                                value={data.supplier_id}
                                onChange={(e) =>
                                    setData('supplier_id', e.target.value)
                                }
                                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-blue-400"
                            >
                                <option value="">No supplier</option>
                                {suppliers.map((supplier) => (
                                    <option key={supplier.id} value={supplier.id}>
                                        {supplier.name}
                                    </option>
                                ))}
                            </select>
                            {errors.supplier_id && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.supplier_id}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium">
                                Date Received *
                            </label>
                            <input
                                type="date"
                                value={data.received_at}
                                onChange={(e) =>
                                    setData('received_at', e.target.value)
                                }
                                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-blue-400"
                            />
                            {errors.received_at && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.received_at}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium">
                            Notes
                        </label>
                        <textarea
                            rows={3}
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-blue-400"
                        />
                        {errors.notes && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.notes}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 border-t pt-5">
                        <Link
                            href="/admin/stock-ins"
                            className="rounded-lg border px-4 py-2.5 text-sm"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {processing ? 'Updating...' : 'Update Stock In'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
