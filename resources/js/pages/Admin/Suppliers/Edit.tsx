import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { FormEvent } from 'react';

interface Supplier {
    id: number;
    name: string;
    contact_person: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    notes: string | null;
    is_active: boolean;
}

export default function Edit({ supplier }: { supplier: Supplier }) {
    const { data, setData, put, processing, errors } = useForm({
        name: supplier.name,
        contact_person: supplier.contact_person ?? '',
        phone: supplier.phone ?? '',
        email: supplier.email ?? '',
        address: supplier.address ?? '',
        notes: supplier.notes ?? '',
        is_active: supplier.is_active,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(`/admin/suppliers/${supplier.id}`);
    };

    return (
        <AppLayout>
            <Head title="Edit Supplier" />

            <div className="mx-auto max-w-3xl space-y-6 p-6">
                <Link
                    href="/admin/suppliers"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600"
                >
                    <ArrowLeft size={17} /> Back to Suppliers
                </Link>

                <div>
                    <h1 className="text-2xl font-bold">Edit Supplier</h1>
                    <p className="text-sm text-gray-500">
                        Update the supplier information.
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-5 rounded-xl border bg-white p-6 shadow-sm"
                >
                    <div>
                        <label className="mb-1.5 block text-sm font-medium">
                            Name *
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-teal-400"
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">
                                Contact Person
                            </label>
                            <input
                                type="text"
                                value={data.contact_person}
                                onChange={(e) =>
                                    setData('contact_person', e.target.value)
                                }
                                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-teal-400"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium">
                                Phone
                            </label>
                            <input
                                type="text"
                                value={data.phone}
                                onChange={(e) =>
                                    setData('phone', e.target.value)
                                }
                                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-teal-400"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium">
                            Email
                        </label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-teal-400"
                        />
                        {errors.email && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium">
                            Address
                        </label>
                        <textarea
                            rows={3}
                            value={data.address}
                            onChange={(e) =>
                                setData('address', e.target.value)
                            }
                            className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-teal-400"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium">
                            Notes
                        </label>
                        <textarea
                            rows={2}
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-teal-400"
                        />
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(e) =>
                                setData('is_active', e.target.checked)
                            }
                            className="accent-teal-600"
                        />
                        Active supplier
                    </label>

                    <div className="flex justify-end gap-3 border-t pt-5">
                        <Link
                            href="/admin/suppliers"
                            className="rounded-lg border px-4 py-2.5 text-sm"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
                        >
                            {processing ? 'Updating...' : 'Update Supplier'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
