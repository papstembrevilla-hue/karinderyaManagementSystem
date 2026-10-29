import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface StockIn {
    id: number;
    quantity: number;
    unit_cost: number;
    total_cost: number;
    received_at: string;
    notes: string | null;
    ingredient: { id: number; ingredient_name: string; unit: string } | null;
}

interface Supplier {
    id: number;
    name: string;
    contact_person: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    notes: string | null;
    is_active: boolean;
    stock_ins: StockIn[];
}

export default function Show({ supplier }: { supplier: Supplier }) {
    return (
        <AppLayout>
            <Head title={`Supplier - ${supplier.name}`} />

            <div className="mx-auto max-w-4xl space-y-6 p-6">
                <Link
                    href="/admin/suppliers"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600"
                >
                    <ArrowLeft size={17} /> Back to Suppliers
                </Link>

                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">
                                {supplier.name}
                            </h1>
                            <p className="text-sm text-gray-500">
                                {supplier.contact_person ||
                                    'No contact person'}
                            </p>
                        </div>

                        <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                                supplier.is_active
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                            }`}
                        >
                            {supplier.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium">
                                {supplier.phone || '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">
                                {supplier.email || '-'}
                            </p>
                        </div>
                        <div className="sm:col-span-2">
                            <p className="text-sm text-gray-500">Address</p>
                            <p className="font-medium">
                                {supplier.address || '-'}
                            </p>
                        </div>
                        <div className="sm:col-span-2">
                            <p className="text-sm text-gray-500">Notes</p>
                            <p className="font-medium">
                                {supplier.notes || '-'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <Link
                            href={`/admin/suppliers/${supplier.id}/edit`}
                            className="rounded-lg bg-teal-600 px-5 py-2 text-white hover:bg-teal-700"
                        >
                            Edit Supplier
                        </Link>
                    </div>
                </div>

                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="mb-4 font-bold">Recent Stock-ins</h2>

                    {supplier.stock_ins.length === 0 ? (
                        <p className="py-6 text-center text-sm text-gray-500">
                            No stock-in history yet.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-3">Date</th>
                                        <th className="p-3">Ingredient</th>
                                        <th className="p-3">Quantity</th>
                                        <th className="p-3">Total Cost</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {supplier.stock_ins.map((stockIn) => (
                                        <tr
                                            key={stockIn.id}
                                            className="border-t"
                                        >
                                            <td className="p-3">
                                                {stockIn.received_at}
                                            </td>
                                            <td className="p-3">
                                                {stockIn.ingredient
                                                    ?.ingredient_name || '-'}
                                            </td>
                                            <td className="p-3">
                                                {stockIn.quantity}{' '}
                                                {stockIn.ingredient?.unit}
                                            </td>
                                            <td className="p-3">
                                                ₱
                                                {Number(
                                                    stockIn.total_cost,
                                                ).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
