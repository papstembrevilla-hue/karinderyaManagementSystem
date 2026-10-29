import FlashMessage from '@/components/FlashMessage';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

interface Supplier {
    id: number;
    name: string;
    contact_person: string | null;
    phone: string | null;
    email: string | null;
    is_active: boolean;
    stock_ins_count: number;
}

interface Props {
    suppliers: {
        data: Supplier[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: { search: string };
}

export default function Index({ suppliers, filters }: Props) {
    const form = useForm({ search: filters.search ?? '' });
    const [onDelete, setOnDelete] = useState<Supplier | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (form.isDirty) {
                form.get('/admin/suppliers', {
                    preserveState: true,
                    preserveScroll: true,
                });
            }
        }, 300);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.data]);

    const submitSearch = (e: FormEvent) => {
        e.preventDefault();
        form.get('/admin/suppliers');
    };

    const confirmDelete = () => {
        if (!onDelete) return;
        router.delete(`/admin/suppliers/${onDelete.id}`);
        setOnDelete(null);
    };

    return (
        <AppLayout>
            <Head title="Suppliers" />
            <FlashMessage />

            <div className="p-6">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Suppliers</h1>
                        <p className="text-gray-500">
                            Manage the suppliers of your ingredients.
                        </p>
                    </div>

                    <Link
                        href="/admin/suppliers/create"
                        className="rounded-lg bg-teal-600 px-4 py-2 text-center text-white hover:bg-teal-700"
                    >
                        + Add Supplier
                    </Link>
                </div>

                <form onSubmit={submitSearch} className="mb-5 max-w-md">
                    <div className="relative">
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
                            placeholder="Search suppliers..."
                            className="w-full rounded-lg border px-10 py-2.5 outline-none focus:border-teal-400"
                        />
                    </div>
                </form>

                <div className="overflow-hidden rounded-xl bg-white shadow">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left">
                                        Name
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Contact
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Phone
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Stock-ins
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Status
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
                                {suppliers.data.map((supplier) => (
                                    <tr
                                        key={supplier.id}
                                        className="border-t hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 font-medium">
                                            <Link
                                                href={`/admin/suppliers/${supplier.id}`}
                                                className="hover:underline"
                                            >
                                                {supplier.name}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {supplier.contact_person || '-'}
                                            {supplier.email && (
                                                <p className="text-xs text-gray-500">
                                                    {supplier.email}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {supplier.phone || '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {supplier.stock_ins_count}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                    supplier.is_active
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}
                                            >
                                                {supplier.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-3">
                                                <Link
                                                    href={`/admin/suppliers/${supplier.id}`}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    View
                                                </Link>
                                                <Link
                                                    href={`/admin/suppliers/${supplier.id}/edit`}
                                                    className="text-green-600 hover:underline"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setOnDelete(supplier)
                                                    }
                                                    className="text-red-600 hover:underline"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {suppliers.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-10 text-center text-gray-500"
                                        >
                                            {form.data.search
                                                ? 'No suppliers match your search.'
                                                : 'No suppliers yet. Add your first supplier.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {suppliers.links.length > 3 && (
                        <div className="flex flex-wrap items-center gap-2 border-t px-4 py-3">
                            {suppliers.links.map((link, index) => (
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
                                            ? 'border-teal-600 bg-teal-600 text-white'
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
            </div>

            <Dialog
                open={onDelete !== null}
                onOpenChange={(open) => !open && setOnDelete(null)}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Supplier</DialogTitle>
                        <DialogDescription>
                            Delete{' '}
                            <span className="font-semibold">
                                {onDelete?.name}
                            </span>
                            ? Suppliers with stock-in history are deactivated
                            instead of deleted to preserve records.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setOnDelete(null)}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
