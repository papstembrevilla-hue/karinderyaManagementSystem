
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { FormEvent } from 'react';

type CustomerForm = {
    customer_code: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    notes: string;
    is_active: boolean;
};

export default function Create() {
    const { data, setData, post, processing, errors } =
        useForm<CustomerForm>({
            customer_code: '',
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            address: '',
            notes: '',
            is_active: true,
        });

    function submit(event: FormEvent) {
        event.preventDefault();
        post('/customers');
    }

    const fields = [
        { name: 'customer_code', label: 'Customer Code', required: true },
        { name: 'first_name', label: 'First Name', required: true },
        { name: 'last_name', label: 'Last Name', required: true },
        { name: 'email', label: 'Email', required: false },
        { name: 'phone', label: 'Phone', required: false },
    ] as const;

    return (
        <AppLayout>
            <Head title="Add Customer" />

            <div className="mx-auto max-w-3xl space-y-6 p-6">
                <Link
                    href="/customers"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600"
                >
                    <ArrowLeft size={17} /> Back to Customers
                </Link>

                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Add Customer
                    </h1>
                    <p className="text-sm text-gray-500">
                        Enter the customer's information below.
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-5 rounded-xl border border-orange-100 bg-white p-6 shadow-sm"
                >
                    <div className="grid gap-5 sm:grid-cols-2">
                        {fields.map((field) => (
                            <div key={field.name}>
                                <label className="mb-1.5 block text-sm font-medium">
                                    {field.label}
                                    {field.required && ' *'}
                                </label>
                                <input
                                    required={field.required}
                                    type={
                                        field.name === 'email'
                                            ? 'email'
                                            : 'text'
                                    }
                                    value={data[field.name]}
                                    onChange={(event) =>
                                        setData(field.name, event.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-orange-400"
                                />
                                {errors[field.name] && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors[field.name]}
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
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-orange-400"
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
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-orange-400"
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
                            {processing ? 'Saving...' : 'Save Customer'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
