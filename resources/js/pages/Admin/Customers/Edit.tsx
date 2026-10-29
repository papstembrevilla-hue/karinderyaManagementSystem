
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { FormEvent } from 'react';

type Customer = {
    id: number;
    customer_code: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    notes: string | null;
    is_active: boolean;
};

export default function Edit({ customer }: { customer: Customer }) {
    const { data, setData, put, processing, errors } = useForm({
        customer_code: customer.customer_code,
        first_name: customer.first_name,
        last_name: customer.last_name,
        email: customer.email ?? '',
        phone: customer.phone ?? '',
        address: customer.address ?? '',
        notes: customer.notes ?? '',
        is_active: customer.is_active,
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        put(`/customers/${customer.id}`);
    }

    return (
        <AppLayout>
            <Head title="Edit Customer" />

            <div className="mx-auto max-w-3xl space-y-6 p-6">
                <Link
                    href="/customers"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600"
                >
                    <ArrowLeft size={17} /> Back to Customers
                </Link>

                <h1 className="text-2xl font-bold text-gray-800">
                    Edit Customer
                </h1>

                <form
                    onSubmit={submit}
                    className="space-y-5 rounded-xl border border-orange-100 bg-white p-6 shadow-sm"
                >
                    <div className="grid gap-5 sm:grid-cols-2">
                        {(
                            [
                                ['customer_code', 'Customer Code'],
                                ['first_name', 'First Name'],
                                ['last_name', 'Last Name'],
                                ['email', 'Email'],
                                ['phone', 'Phone'],
                            ] as const
                        ).map(([name, label]) => (
                            <div key={name}>
                                <label className="mb-1.5 block text-sm font-medium">
                                    {label}
                                </label>
                                <input
                                    type={name === 'email' ? 'email' : 'text'}
                                    required={
                                        name === 'customer_code' ||
                                        name === 'first_name' ||
                                        name === 'last_name'
                                    }
                                    value={data[name]}
                                    onChange={(event) =>
                                        setData(name, event.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-orange-400"
                                />
                                {errors[name] && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors[name]}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium">
                            Address
                        </label>
                        <textarea
                            value={data.address}
                            onChange={(event) =>
                                setData('address', event.target.value)
                            }
                            rows={3}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5"
                        />
                        {errors.address && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.address}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium">
                            Notes
                        </label>
                        <textarea
                            value={data.notes}
                            onChange={(event) =>
                                setData('notes', event.target.value)
                            }
                            rows={2}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5"
                        />
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(event) =>
                                setData('is_active', event.target.checked)
                            }
                            className="accent-orange-500"
                        />
                        Active customer
                    </label>

                    <div className="flex justify-end gap-3 border-t pt-5">
                        <Link
                            href="/customers"
                            className="rounded-lg border px-4 py-2.5 text-sm"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                        >
                            {processing ? 'Updating...' : 'Update Customer'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
