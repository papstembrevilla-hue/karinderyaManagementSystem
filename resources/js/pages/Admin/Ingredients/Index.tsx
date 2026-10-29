import FlashMessage from '@/components/FlashMessage';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Ingredient {
    id: number;
    ingredient_name: string;
    category: string | null;
    photo: string | null;
    unit: string;
    quantity: number;
    reorder_level: number;
    unit_cost: number;
    expiration_date: string | null;
    status: string;
}

interface Props {
    ingredients: {
        data: Ingredient[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: {
        search: string;
        status: string;
    };
}

export default function Index({ ingredients, filters }: Props) {
    const form = useForm({
        search: filters.search ?? '',
        status: filters.status ?? '',
    });

    const [onDelete, setOnDelete] = useState<Ingredient | null>(null);

    /*
    |--------------------------------------------------------------------------
    | Server-side Search (debounced)
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const timer = setTimeout(() => {
            if (form.isDirty) {
                form.get('/admin/ingredients', {
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
        form.get('/admin/ingredients');
    };

    const deleteIngredient = () => {
        if (!onDelete) return;

        router.delete(`/admin/ingredients/${onDelete.id}`);

        setOnDelete(null);
    };

    return (
        <AppLayout>
            <Head title="Ingredients" />

            <FlashMessage />

            <div className="p-6">
                {/* HEADER */}

                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Ingredients</h1>

                        <p className="text-gray-500">
                            Manage your inventory ingredients.
                        </p>
                    </div>

                    <Link
                        href="/admin/ingredients/create"
                        className="rounded-lg bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700"
                    >
                        + Add Ingredient
                    </Link>
                </div>

                {/* FILTERS */}

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
                            placeholder="Search by name or category..."
                            className="w-full rounded-lg border px-10 py-2.5 outline-none focus:border-blue-400"
                        />
                    </div>

                    <select
                        value={form.data.status}
                        onChange={(e) =>
                            form.setData('status', e.target.value)
                        }
                        className="rounded-lg border px-3 py-2.5 outline-none focus:border-blue-400"
                    >
                        <option value="">All Statuses</option>
                        <option value="In Stock">In Stock</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                    </select>
                </form>

                {/* TABLE */}

                <div className="overflow-hidden rounded-xl bg-white shadow">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left">
                                        Photo
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Ingredient
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Category
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Quantity
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Unit Cost
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Expiration
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
                                {ingredients.data.map((ingredient) => (
                                    <tr
                                        key={ingredient.id}
                                        className="border-t hover:bg-gray-50"
                                    >
                                        {/* PHOTO */}

                                        <td className="px-4 py-3">
                                            {ingredient.photo ? (
                                                <img
                                                    src={`/storage/${ingredient.photo}`}
                                                    alt={
                                                        ingredient.ingredient_name
                                                    }
                                                    className="h-12 w-12 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                                                    No Photo
                                                </div>
                                            )}
                                        </td>

                                        {/* NAME */}

                                        <td className="px-4 py-3 font-medium">
                                            <Link
                                                href={`/admin/ingredients/${ingredient.id}`}
                                                className="hover:underline"
                                            >
                                                {ingredient.ingredient_name}
                                            </Link>
                                        </td>

                                        {/* CATEGORY */}

                                        <td className="px-4 py-3">
                                            {ingredient.category || '-'}
                                        </td>

                                        {/* QUANTITY */}

                                        <td className="px-4 py-3">
                                            {ingredient.quantity}{' '}
                                            {ingredient.unit}
                                        </td>

                                        {/* COST */}

                                        <td className="px-4 py-3">
                                            ₱
                                            {Number(
                                                ingredient.unit_cost,
                                            ).toFixed(2)}
                                        </td>

                                        {/* EXPIRATION */}

                                        <td className="px-4 py-3">
                                            {ingredient.expiration_date || '-'}
                                        </td>

                                        {/* STATUS */}

                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                    ingredient.status ===
                                                    'In Stock'
                                                        ? 'bg-green-100 text-green-700'
                                                        : ingredient.status ===
                                                          'Low Stock'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}
                                            >
                                                {ingredient.status}
                                            </span>
                                        </td>

                                        {/* ACTIONS */}

                                        <td className="px-4 py-3">
                                            <div className="flex gap-3">
                                                <Link
                                                    href={`/admin/ingredients/${ingredient.id}`}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    View
                                                </Link>

                                                <Link
                                                    href={`/admin/ingredients/${ingredient.id}/edit`}
                                                    className="text-green-600 hover:underline"
                                                >
                                                    Edit
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setOnDelete(ingredient)
                                                    }
                                                    className="text-red-600 hover:underline"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {ingredients.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-4 py-10 text-center text-gray-500"
                                        >
                                            {form.data.search ||
                                            form.data.status
                                                ? 'No ingredients match your filters.'
                                                : 'No ingredients found. Add your first ingredient to get started.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}

                    {ingredients.links.length > 3 && (
                        <div className="flex flex-wrap items-center gap-2 border-t px-4 py-3">
                            {ingredients.links.map((link, index) => (
                                <button
                                    key={index}
                                    disabled={
                                        !link.url || form.processing
                                    }
                                    onClick={() =>
                                        link.url &&
                                        router.visit(link.url, {
                                            preserveState: true,
                                            preserveScroll: true,
                                        })
                                    }
                                    className={`rounded-md border px-3 py-1.5 text-sm ${
                                        link.active
                                            ? 'border-blue-600 bg-blue-600 text-white'
                                            : 'border-gray-200 hover:bg-gray-50'
                                    } disabled:opacity-40`}
                                >
                                    {link.label.replace(/&laquo;|&raquo;/g, '')}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* DELETE CONFIRMATION DIALOG */}

            <Dialog
                open={onDelete !== null}
                onOpenChange={(open) => !open && setOnDelete(null)}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Ingredient</DialogTitle>

                        <DialogDescription>
                            Are you sure you want to delete{' '}
                            <span className="font-semibold">
                                {onDelete?.ingredient_name}
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

                        <Button
                            variant="destructive"
                            onClick={deleteIngredient}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
