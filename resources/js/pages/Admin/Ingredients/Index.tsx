import FlashMessage from '@/components/FlashMessage';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';

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
    ingredients: Ingredient[];
}

export default function Index({
    ingredients,
}: Props) {

    const deleteIngredient = (id: number) => {

        if (
            confirm(
                'Are you sure you want to delete this ingredient?',
            )
        ) {
            router.delete(
                `/admin/ingredients/${id}`,
            );
        }
    };

    return (
        <AppLayout>

            <Head title="Ingredients" />

            <FlashMessage />

            <div className="p-6">

                {/* HEADER */}

                <div className="mb-6 flex items-center justify-between">

                    <div>
                        <h1 className="text-2xl font-bold">
                            Ingredients
                        </h1>

                        <p className="text-gray-500">
                            Manage your inventory ingredients.
                        </p>
                    </div>

                    <Link
                        href="/admin/ingredients/create"
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                        + Add Ingredient
                    </Link>

                </div>

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

                            <tbody>

                                {ingredients.map(
                                    (ingredient) => (

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
                                            {
                                                ingredient.ingredient_name
                                            }
                                        </td>

                                        {/* CATEGORY */}

                                        <td className="px-4 py-3">
                                            {
                                                ingredient.category ||
                                                '-'
                                            }
                                        </td>

                                        {/* QUANTITY */}

                                        <td className="px-4 py-3">
                                            {
                                                ingredient.quantity
                                            }{' '}
                                            {
                                                ingredient.unit
                                            }
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
                                            {
                                                ingredient.expiration_date ||
                                                '-'
                                            }
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
                                                {
                                                    ingredient.status
                                                }
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
                                                        deleteIngredient(
                                                            ingredient.id,
                                                        )
                                                    }
                                                    className="text-red-600 hover:underline"
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                                {ingredients.length === 0 && (

                                    <tr>

                                        <td
                                            colSpan={8}
                                            className="px-4 py-10 text-center text-gray-500"
                                        >
                                            No ingredients found.
                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </AppLayout>
    );
}