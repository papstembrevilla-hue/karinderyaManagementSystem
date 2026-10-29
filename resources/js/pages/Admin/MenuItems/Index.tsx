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

interface MenuItem {
    id: number;
    name: string;
    description: string | null;
    price: number;
    photo: string | null;
    is_available: boolean;
    category: { id: number; name: string };
}

interface Props {
    menuItems: {
        data: MenuItem[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    categories: { id: number; name: string }[];
    filters: {
        search: string;
        category_id: string;
        availability: string;
    };
}

export default function Index({ menuItems, categories, filters }: Props) {
    const form = useForm({
        search: filters.search ?? '',
        category_id: filters.category_id ?? '',
        availability: filters.availability ?? '',
    });

    const [onDelete, setOnDelete] = useState<MenuItem | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (form.isDirty) {
                form.get('/admin/menu-items', {
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
        form.get('/admin/menu-items');
    };

    const confirmDelete = () => {
        if (!onDelete) return;
        router.delete(`/admin/menu-items/${onDelete.id}`);
        setOnDelete(null);
    };

    return (
        <AppLayout>
            <Head title="Food Management" />
            <FlashMessage />

            <div className="p-6">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Food Management</h1>
                        <p className="text-gray-500">
                            Manage your karinderya menu items.
                        </p>
                    </div>

                    <Link
                        href="/admin/menu-items/create"
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-center text-white hover:bg-emerald-700"
                    >
                        + Add Menu Item
                    </Link>
                </div>

                <form
                    onSubmit={submitSearch}
                    className="mb-5 flex flex-col gap-3 sm:flex-row"
                >
                    <div className="relative sm:max-w-md sm:flex-1">
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
                            placeholder="Search menu items..."
                            className="w-full rounded-lg border px-10 py-2.5 outline-none focus:border-emerald-400"
                        />
                    </div>

                    <select
                        value={form.data.category_id}
                        onChange={(e) =>
                            form.setData('category_id', e.target.value)
                        }
                        className="rounded-lg border px-3 py-2.5 outline-none focus:border-emerald-400"
                    >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={form.data.availability}
                        onChange={(e) =>
                            form.setData('availability', e.target.value)
                        }
                        className="rounded-lg border px-3 py-2.5 outline-none focus:border-emerald-400"
                    >
                        <option value="">All Availability</option>
                        <option value="available">Available</option>
                        <option value="unavailable">Unavailable</option>
                    </select>
                </form>

                <div className="overflow-hidden rounded-xl bg-white shadow">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left">
                                        Photo
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Name
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Category
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Price
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Availability
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
                                {menuItems.data.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-t hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3">
                                            {item.photo ? (
                                                <img
                                                    src={`/storage/${item.photo}`}
                                                    alt={item.name}
                                                    className="h-12 w-12 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                                                    No Photo
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-medium">
                                            <Link
                                                href={`/admin/menu-items/${item.id}`}
                                                className="hover:underline"
                                            >
                                                {item.name}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            {item.category?.name || '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            ₱{Number(item.price).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                    item.is_available
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}
                                            >
                                                {item.is_available
                                                    ? 'Available'
                                                    : 'Unavailable'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-3">
                                                <Link
                                                    href={`/admin/menu-items/${item.id}`}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    View
                                                </Link>
                                                <Link
                                                    href={`/admin/menu-items/${item.id}/edit`}
                                                    className="text-green-600 hover:underline"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setOnDelete(item)
                                                    }
                                                    className="text-red-600 hover:underline"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {menuItems.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-10 text-center text-gray-500"
                                        >
                                            {form.data.search ||
                                            form.data.category_id ||
                                            form.data.availability
                                                ? 'No menu items match your filters.'
                                                : 'No menu items yet. Add your first dish.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {menuItems.links.length > 3 && (
                        <div className="flex flex-wrap items-center gap-2 border-t px-4 py-3">
                            {menuItems.links.map((link, index) => (
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
                                            ? 'border-emerald-600 bg-emerald-600 text-white'
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
                        <DialogTitle>Delete Menu Item</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete{' '}
                            <span className="font-semibold">
                                {onDelete?.name}
                            </span>
                            ? This action cannot be undone.
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
