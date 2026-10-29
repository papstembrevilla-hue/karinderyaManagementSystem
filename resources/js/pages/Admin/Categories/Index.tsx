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

interface Category {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    menu_items_count: number;
}

interface Props {
    categories: {
        data: Category[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: { search: string };
}

export default function Index({ categories, filters }: Props) {
    const form = useForm({ search: filters.search ?? '' });
    const [onDelete, setOnDelete] = useState<Category | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (form.isDirty) {
                form.get('/admin/categories', {
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
        form.get('/admin/categories');
    };

    const confirmDelete = () => {
        if (!onDelete) return;
        router.delete(`/admin/categories/${onDelete.id}`);
        setOnDelete(null);
    };

    return (
        <AppLayout>
            <Head title="Categories" />
            <FlashMessage />

            <div className="p-6">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Categories</h1>
                        <p className="text-gray-500">
                            Organize your menu items into categories.
                        </p>
                    </div>

                    <Link
                        href="/admin/categories/create"
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-center text-white hover:bg-indigo-700"
                    >
                        + Add Category
                    </Link>
                </div>

                <form
                    onSubmit={submitSearch}
                    className="mb-5 max-w-md"
                >
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
                            placeholder="Search categories..."
                            className="w-full rounded-lg border px-10 py-2.5 outline-none focus:border-indigo-400"
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
                                        Description
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Menu Items
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
                                {categories.data.map((category) => (
                                    <tr
                                        key={category.id}
                                        className="border-t hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 font-medium">
                                            {category.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {category.description || '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {category.menu_items_count}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                    category.is_active
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}
                                            >
                                                {category.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-3">
                                                <Link
                                                    href={`/admin/categories/${category.id}/edit`}
                                                    className="text-green-600 hover:underline"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setOnDelete(category)
                                                    }
                                                    className="text-red-600 hover:underline"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {categories.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-4 py-10 text-center text-gray-500"
                                        >
                                            {form.data.search
                                                ? 'No categories match your search.'
                                                : 'No categories yet. Add your first category.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {categories.links.length > 3 && (
                        <div className="flex flex-wrap items-center gap-2 border-t px-4 py-3">
                            {categories.links.map((link, index) => (
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
                                            ? 'border-indigo-600 bg-indigo-600 text-white'
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
                        <DialogTitle>Delete Category</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete{' '}
                            <span className="font-semibold">
                                {onDelete?.name}
                            </span>
                            ? Categories that still contain menu items cannot
                            be deleted.
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
