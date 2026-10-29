
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil } from 'lucide-react';

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
    created_at: string;
};

export default function Show({ customer }: { customer: Customer }) {
    const fields = [
        ['Customer Code', customer.customer_code],
        ['First Name', customer.first_name],
        ['Last Name', customer.last_name],
        ['Email', customer.email],
        ['Phone', customer.phone],
        ['Address', customer.address],
        ['Notes', customer.notes],
        ['Created At', customer.created_at],
    ] as const;

    return (
        <AppLayout>
            <Head title="Customer Details" />

            <div className="mx-auto max-w-3xl space-y-6 p-6">
                <Link
                    href="/customers"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600"
                >
                    <ArrowLeft size={17} /> Back to Customers
                </Link>

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Customer Details
                        </h1>
                        <p className="text-sm text-gray-500">
                            {customer.first_name} {customer.last_name}
                        </p>
                    </div>

                    <Link
                        href={`/customers/${customer.id}/edit`}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-white hover:bg-orange-600"
                    >
                        <Pencil size={17} /> Edit Customer
                    </Link>
                </div>

                <div className="rounded-xl border border-orange-100 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-xl font-bold text-orange-600">
                            {customer.first_name.charAt(0)}
                            {customer.last_name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">
                                {customer.first_name} {customer.last_name}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {customer.customer_code}
                            </p>
                            <span
                                className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs ${
                                    customer.is_active
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                                {customer.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        {fields.map(([label, value]) => (
                            <div
                                key={label}
                                className="border-b border-gray-100 pb-3"
                            >
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    {label}
                                </p>
                                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">
                                    {value || '—'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
