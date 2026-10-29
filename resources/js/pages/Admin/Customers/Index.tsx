
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { SearchIcon, Plus, Eye, Pencil, Trash2, Users } from 'lucide-react';
import { useEffect } from 'react';

type Customer = {
    id: number;
    customer_code: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    is_active: boolean;
};

type Props = {
    customers: {
        data: Customer[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
    };
    filters: {
        search: string;
    };
};

export default function Index({ customers, filters }: Props) {
    const form = useForm({
        search: filters.search ?? '',
    });

    // Server-side search (debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (form.isDirty) {
                form.get('/customers', {
                    preserveState: true,
                    preserveScroll: true,
                });
            }
        }, 300);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.data]);

    function deleteCustomer(customer: Customer) {
        if (confirm(`Delete ${customer.first_name} ${customer.last_name}?`)) {
            router.delete(`/customers/${customer.id}`);
        }
    }

    return (
        <AppLayout>
            <Head title="Customers" />

            <div className="space-y-6 p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Customers
                        </h1>
                        <p className="text-sm text-gray-500">
                            Manage your karinderya customer records.
                        </p>
                    </div>

                    <Link
                        href="/customers/create"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 font-medium text-white hover:bg-orange-600"
                    >
                        <Plus size={18} />
                        Add Customer
                    </Link>
                </div>

                <div className="rounded-xl border border-orange-100 bg-white p-5 shadow-sm">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="rounded-lg bg-orange-100 p-3 text-orange-600">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">
                                Customers on this page
                            </p>
                            <p className="text-2xl font-bold">
                                {customers.data.length}
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            form.get('/customers');
                        }}
                    >
                        <div className="relative mb-5 max-w-md">
                            <SearchIcon
                                className="absolute left-3 top-3 text-gray-400"
                                size={18}
                            />
                            <input
                                value={form.data.search}
                                onChange={(event) =>
                                    form.setData('search', event.target.value)
                                }
                                placeholder="Search by name, email, phone or code..."
                                className={`w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 outline-none focus:border-orange-400 ${
                                    form.processing ? 'opacity-60' : ''
                                }`}
                            />
                        </div>
                    </form>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-orange-50 text-gray-600">
                                <tr>
                                    <th className="p-3">Customer Code</th>
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Contact</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {customers.data.map((customer) => (
                                    <tr
                                        key={customer.id}
                                        className="border-b border-gray-100 hover:bg-orange-50/40"
                                    >
                                        <td className="p-3 font-medium">
                                            {customer.customer_code}
                                        </td>
                                        <td className="p-3">
                                            {customer.first_name}{' '}
                                            {customer.last_name}
                                            <p className="text-xs text-gray-500">
                                                {customer.email || 'No email'}
                                            </p>
                                        </td>
                                        <td className="p-3">
                                            {customer.phone || '—'}
                                        </td>
                                        <td className="p-3">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    customer.is_active
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}
                                            >
                                                {customer.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/customers/${customer.id}`}
                                                    title="View"
                                                    className="rounded-md p-2 text-blue-600 hover:bg-blue-50"
                                                >
                                                    <Eye size={17} />
                                                </Link>
                                                <Link
                                                    href={`/customers/${customer.id}/edit`}
                                                    title="Edit"
                                                    className="rounded-md p-2 text-orange-600 hover:bg-orange-50"
                                                >
                                                    <Pencil size={17} />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteCustomer(customer)}
                                                    title="Delete"
                                                    className="rounded-md p-2 text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 size={17} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {customers.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="p-8 text-center text-gray-500"
                                        >
                                            {form.data.search
                                                ? 'No customers match your search.'
                                                : 'No customers found.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                            {customers.links.map((link, index) => (
                                <button
                                    key={index}
                                    disabled={!link.url}
                                    onClick={() =>
                                        link.url && router.visit(link.url)
                                    }
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                    className={`rounded-md border px-3 py-2 text-sm ${
                                        link.active
                                            ? 'border-orange-500 bg-orange-500 text-white'
                                            : 'border-gray-200 hover:bg-orange-50'
                                    } disabled:opacity-40`}
                                />
                            ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
