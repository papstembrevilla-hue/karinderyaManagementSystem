import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

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
    description: string | null;
}

interface Props {
    ingredient: Ingredient;
}

export default function Edit({ ingredient }: Props) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm({
        ingredient_name: ingredient.ingredient_name,
        category: ingredient.category ?? '',
        photo: null as File | null,
        unit: ingredient.unit,
        quantity: String(ingredient.quantity),
        reorder_level: String(ingredient.reorder_level),
        unit_cost: String(ingredient.unit_cost),
        expiration_date: ingredient.expiration_date ?? '',
        description: ingredient.description ?? '',
        _method: 'PUT',
    });

    const [preview, setPreview] = useState<string | null>(
        ingredient.photo
            ? `/storage/${ingredient.photo}`
            : null
    );

    const submit = (e: FormEvent) => {
        e.preventDefault();

        post(`/admin/ingredients/${ingredient.id}`, {
            forceFormData: true,
        });
    };

    const handlePhotoChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0] ?? null;

        setData('photo', file);

        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    return (
        <AppLayout>
            <Head title="Edit Ingredient" />

            <div className="p-6">

                {/* HEADER */}

                <div className="mb-6">
                    <Link
                        href="/admin/ingredients"
                        className="text-sm text-blue-600 hover:underline"
                    >
                        ← Back to Ingredients
                    </Link>

                    <h1 className="mt-2 text-2xl font-bold">
                        Edit Ingredient
                    </h1>

                    <p className="text-gray-500">
                        Update the ingredient information.
                    </p>
                </div>

                {/* FORM */}

                <form
                    onSubmit={submit}
                    className="max-w-4xl rounded-xl bg-white p-6 shadow"
                >

                    {/* PHOTO */}

                    <div className="mb-6">
                        <label className="mb-2 block font-medium">
                            Ingredient Photo
                        </label>

                        <div className="flex items-center gap-5">

                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Ingredient preview"
                                    className="h-28 w-28 rounded-lg object-cover"
                                />
                            ) : (
                                <div className="flex h-28 w-28 items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400">
                                    No Photo
                                </div>
                            )}

                            <div>
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                    onChange={handlePhotoChange}
                                    className="rounded-lg border p-2"
                                />

                                <p className="mt-1 text-xs text-gray-500">
                                    JPG, JPEG, PNG or WEBP. Maximum 2MB.
                                </p>
                            </div>
                        </div>

                        {errors.photo && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.photo}
                            </p>
                        )}
                    </div>

                    {/* INGREDIENT NAME */}

                    <div className="mb-4">
                        <label className="mb-1 block font-medium">
                            Ingredient Name *
                        </label>

                        <input
                            type="text"
                            value={data.ingredient_name}
                            onChange={(e) =>
                                setData(
                                    'ingredient_name',
                                    e.target.value
                                )
                            }
                            className="w-full rounded-lg border px-3 py-2"
                            placeholder="Example: Rice"
                        />

                        {errors.ingredient_name && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.ingredient_name}
                            </p>
                        )}
                    </div>

                    {/* CATEGORY + UNIT */}

                    <div className="grid gap-4 md:grid-cols-2">

                        <div>
                            <label className="mb-1 block font-medium">
                                Category
                            </label>

                            <input
                                type="text"
                                value={data.category}
                                onChange={(e) =>
                                    setData(
                                        'category',
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border px-3 py-2"
                                placeholder="Meat, Vegetable, Grains..."
                            />

                            {errors.category && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.category}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block font-medium">
                                Unit *
                            </label>

                            <select
                                value={data.unit}
                                onChange={(e) =>
                                    setData(
                                        'unit',
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border px-3 py-2"
                            >
                                <option value="kg">
                                    Kilogram (kg)
                                </option>

                                <option value="g">
                                    Gram (g)
                                </option>

                                <option value="L">
                                    Liter (L)
                                </option>

                                <option value="ml">
                                    Milliliter (ml)
                                </option>

                                <option value="pcs">
                                    Pieces (pcs)
                                </option>

                                <option value="bottle">
                                    Bottle
                                </option>

                                <option value="pack">
                                    Pack
                                </option>
                            </select>

                            {errors.unit && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.unit}
                                </p>
                            )}
                        </div>

                    </div>

                    {/* QUANTITY */}

                    <div className="mt-4 grid gap-4 md:grid-cols-3">

                        <div>
                            <label className="mb-1 block font-medium">
                                Quantity *
                            </label>

                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.quantity}
                                onChange={(e) =>
                                    setData(
                                        'quantity',
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border px-3 py-2"
                            />

                            {errors.quantity && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.quantity}
                                </p>
                            )}
                        </div>

                        {/* REORDER LEVEL */}

                        <div>
                            <label className="mb-1 block font-medium">
                                Reorder Level *
                            </label>

                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.reorder_level}
                                onChange={(e) =>
                                    setData(
                                        'reorder_level',
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border px-3 py-2"
                            />

                            {errors.reorder_level && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.reorder_level}
                                </p>
                            )}
                        </div>

                        {/* UNIT COST */}

                        <div>
                            <label className="mb-1 block font-medium">
                                Unit Cost *
                            </label>

                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.unit_cost}
                                onChange={(e) =>
                                    setData(
                                        'unit_cost',
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border px-3 py-2"
                            />

                            {errors.unit_cost && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.unit_cost}
                                </p>
                            )}
                        </div>

                    </div>

                    {/* EXPIRATION DATE */}

                    <div className="mt-4">
                        <label className="mb-1 block font-medium">
                            Expiration Date
                        </label>

                        <input
                            type="date"
                            value={data.expiration_date}
                            onChange={(e) =>
                                setData(
                                    'expiration_date',
                                    e.target.value
                                )
                            }
                            className="w-full rounded-lg border px-3 py-2"
                        />

                        {errors.expiration_date && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.expiration_date}
                            </p>
                        )}
                    </div>

                    {/* DESCRIPTION */}

                    <div className="mt-4">
                        <label className="mb-1 block font-medium">
                            Description
                        </label>

                        <textarea
                            rows={4}
                            value={data.description}
                            onChange={(e) =>
                                setData(
                                    'description',
                                    e.target.value
                                )
                            }
                            className="w-full rounded-lg border px-3 py-2"
                            placeholder="Additional information..."
                        />

                        {errors.description && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.description}
                            </p>
                        )}
                    </div>

                    {/* BUTTONS */}

                    <div className="mt-6 flex gap-3">

                        <Link
                            href="/admin/ingredients"
                            className="rounded-lg border px-5 py-2 hover:bg-gray-50"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {processing
                                ? 'Updating...'
                                : 'Update Ingredient'}
                        </button>

                    </div>

                </form>
            </div>
        </AppLayout>
    );
}