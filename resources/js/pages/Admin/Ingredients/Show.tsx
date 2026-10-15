import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';

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
    description: string | null;
}

interface Props {
    ingredient: Ingredient;
}

export default function Show({
    ingredient,
}: Props) {

    return (
        <AppLayout>

            <Head
                title={`Ingredient - ${ingredient.ingredient_name}`}
            />

            <div className="p-6">

                <div className="mb-6">

                    <Link
                        href="/admin/ingredients"
                        className="text-sm text-blue-600 hover:underline"
                    >
                        ← Back to Ingredients
                    </Link>

                    <h1 className="mt-2 text-2xl font-bold">
                        Ingredient Details
                    </h1>

                </div>

                <div className="max-w-4xl rounded-xl bg-white p-6 shadow">

                    <div className="grid gap-8 md:grid-cols-2">

                        {/* PHOTO */}

                        <div>

                            {ingredient.photo ? (

                                <img
                                    src={`/storage/${ingredient.photo}`}
                                    alt={
                                        ingredient.ingredient_name
                                    }
                                    className="h-80 w-full rounded-xl object-cover"
                                />

                            ) : (

                                <div className="flex h-80 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                                    No Photo Available
                                </div>

                            )}

                        </div>

                        {/* DETAILS */}

                        <div>

                            <h2 className="text-2xl font-bold">
                                {ingredient.ingredient_name}
                            </h2>

                            <p className="mt-1 text-gray-500">
                                {ingredient.category || 'No category'}
                            </p>

                            <div className="mt-6 space-y-4">

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Quantity
                                    </p>

                                    <p className="font-medium">
                                        {ingredient.quantity}{' '}
                                        {ingredient.unit}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Reorder Level
                                    </p>

                                    <p className="font-medium">
                                        {ingredient.reorder_level}{' '}
                                        {ingredient.unit}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Unit Cost
                                    </p>

                                    <p className="font-medium">
                                        ₱
                                        {Number(
                                            ingredient.unit_cost,
                                        ).toFixed(2)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Expiration Date
                                    </p>

                                    <p className="font-medium">
                                        {ingredient.expiration_date ||
                                            'No expiration date'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Status
                                    </p>

                                    <span
                                        className={`inline-block rounded-full px-3 py-1 text-sm ${
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
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Description
                                    </p>

                                    <p className="font-medium">
                                        {ingredient.description ||
                                            'No description'}
                                    </p>
                                </div>

                            </div>

                            <div className="mt-6">

                                <Link
                                    href={`/admin/ingredients/${ingredient.id}/edit`}
                                    className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                                >
                                    Edit Ingredient
                                </Link>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </AppLayout>
    );
}