import FlashMessage from '@/components/FlashMessage';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowUpFromLine, Search } from 'lucide-react';
import { FormEvent, useEffect } from 'react';

interface StockOut {
    id: number;
    quantity: string | number;
    reason: string;
    occurred_at: string;
    notes: string | null;
    ingredient: { id: number; ingredient_name: string; unit: string } | null;
}

interface Props {
    stockOuts: {
        data: StockOut[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: { search: string; from: string; to: string };
}

export default function Index({ stockOuts, filters }: Props) {
    const form = useForm({
        search: filters.search ?? '',
        from: filters.from ?? '',
        to: filters.to ?? '',
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            if (form.isDirty) {
                form.get('/admin/stock-outs', {
                    preserveState: true,
                    preserveScroll: true,
                });
            }
        }, 400);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.data]);

    const submitFilters = (e: FormEvent) => {
        e.preventDefault();
        form.get('/admin/stock-outs');
    };

    return (
        <AppLayout>
            <Head title="Stock Out" />
            <FlashMessage />

            <div className="p-6">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold">
                            <ArrowUpFromLine
                                size={22}
                                className="text-rose-600"
                            />
                            Stock Out
                        </h1>
                        <p className="text-gray-500">
                            Record spoilage, damage, adjustments, and
                            operational usage.
                        </p>
                    </div>

                    <Link
                        href="/admin/stock-outs/create"
                        className="rounded-lg bg-rose-600 px-4 py-2 text-center text-white hover:bg-rose-700"
                    >
                        + Record Stock Out
                    </Link>
                </div>

                <form
                    onSubmit={submitFilters}
                    className="mb-5 flex flex-col gap-3 sm:flex-row"
                >
                    <div className="relative sm:max-w-sm sm:flex-1">
                        <Search
                            className="absolute left-3 top-3 text-gray-400"
                            size={18}
                        />
                        <input
                            type="text"
                            value={form.data.search}
                            onChange={(e) =>
                                form.setData('search', e.target.value)
                            }
                            placeholder="Search by ingredient..."
                            className="w-full rounded-lg border px-10 py-2.5 outline-none focus:border-rose-400"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs text-gray-500">
                            From
                        </label>
                        <input
                            type="date"
                            value={form.data.from}
                            onChange={(e) =>
                                form.setData('from', e.target.value)
                            }
                            className="rounded-lg border px-3 py-2 outline-none focus:border-rose-400"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs text-gray-500">
                            To
                        </label>
                        <input
                            type="date"
                            value={form.data.to}
                            onChange={(e) => form.setData('to', e.target.value)}
                            className="rounded-lg border px-3 py-2 outline-none focus:border-rose-400"
                        />
                    </div>
                </form>

                <div className="overflow-hidden rounded-xl bg-white shadow">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left">Date</th>
                                    <th className="px-4 py-3 text-left">
                                        Ingredient
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Quantity
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Reason
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Notes
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody
                                className={
                                    form.processing ? 'opacity-50' : undefined
                                }
                            >
                                {stockOuts.data.map((stockOut) => (
                                    <tr
                                        key={stockOut.id}
                                        className="border-t hover:bg-gray-50"
                                    >
                                        <td className="whitespace-nowrap px-4 py-3">
                                            {stockOut.occurred_at?.slice(0, 10)}
                                        </td>
                                        <td className="px-4 py-3 font-medium">
                                            {stockOut.ingredient
                                                ?.ingredient_name || '-'}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            {stockOut.quantity}{' '}
                                            {stockOut.ingredient?.unit}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700">
                                                {stockOut.reason}
                                            </span>
                                        </td>
                                        <td className="max-w-xs truncate px-4 py-3 text-sm text-gray-600">
                                            {stockOut.notes || '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/admin/stock-outs/${stockOut.id}/edit`}
                                                className="text-green-600 hover:underline"
                                            >
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))}

                                {stockOuts.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-10 text-center text-gray-500"
                                        >
                                            {form.data.search ||
                                            form.data.from ||
                                            form.data.to
                                                ? 'No stock-out records match your filters.'
                                                : 'No stock-out records yet.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {stockOuts.links.length > 3 && (
                        <div className="flex flex-wrap items-center gap-2 border-t px-4 py-3">
                            {stockOuts.links.map((link, index) => (
                                <button
                                    key={index}
                                    disabled={!link.url || form.processing}
                                    onClick={() =>
                                        link.url &&
                                        router.visit(link.url, {
                                            preserveState: true,
                                            preserveScroll: true,
                                        })
                                    }
                                    className={`rounded-md border px-3 py-1.5 text-sm ${
                                        link.active
                                            ? 'border-rose-600 bg-rose-600 text-white'
                                            : 'border-gray-200 hover:bg-gray-50'
                                    } disabled:opacity-40`}
                                >
                                    {link.label.replace(
                                        /&laquo;|&raquo;/g,
                                        '',
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <p className="mt-3 text-xs text-gray-500">
                    Stock-out records are kept as history. Editing a record
                    adjusts the ingredient balance automatically.
                </p>
            </div>
        </AppLayout>
    );
}
