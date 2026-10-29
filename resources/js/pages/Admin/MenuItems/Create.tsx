import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Props {
    categories: { id: number; name: string }[];
}

export default function Create({ categories }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        category_id: '',
        name: '',
        description: '',
        price: '',
        photo: null as File | null,
        is_available: true as boolean,
    });

    const [preview, setPreview] = useState<string | null>(null);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/menu-items', { forceFormData: true });
    };

    const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setData('photo', file);

        if (file) {
            setPreview(URL.createObjectURL(file));
        } else {
            setPreview(null);
        }
    };

    return (
        <AppLayout>
            <Head title="Add Menu Item" />

            <div className="mx-auto max-w-3xl space-y-6 p-6">
                <Link
                    href="/admin/menu-items"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600"
                >
                    <ArrowLeft size={17} /> Back to Menu Items
                </Link>

                <div>
                    <h1 className="text-2xl font-bold">Add Menu Item</h1>
                    <p className="text-sm text-gray-500">
                        Add a new dish to your menu.
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-5 rounded-xl border bg-white p-6 shadow-sm"
                >
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Photo
                        </label>
                        <div className="flex items-center gap-5">
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="h-28 w-28 rounded-lg object-cover"
                                />
                            ) : (
                                <div className="flex h-28 w-28 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                                    No Photo
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                onChange={handlePhoto}
                                className="rounded-lg border p-2"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            JPG, JPEG, PNG or WEBP. Maximum 2MB.
                        </p>
                        {errors.photo && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.photo}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium">
                            Name *
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Chicken Adobo"
                            className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-emerald-400"
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">
                                Category *
                            </label>
                            <select
                                value={data.category_id}
                                onChange={(e) =>
                                    setData('category_id', e.target.value)
                                }
                                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-emerald-400"
                            >
                                <option value="">Select a category</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            {errors.category_id && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.category_id}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium">
                                Price (₱) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.price}
                                onChange={(e) =>
                                    setData('price', e.target.value)
                                }
                                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-emerald-400"
                            />
                            {errors.price && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.price}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium">
                            Description
                        </label>
                        <textarea
                            rows={4}
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-emerald-400"
                        />
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={data.is_available}
                            onChange={(e) =>
                                setData('is_available', e.target.checked)
                            }
                            className="accent-emerald-600"
                        />
                        Available for ordering
                    </label>

                    <div className="flex justify-end gap-3 border-t pt-5">
                        <Link
                            href="/admin/menu-items"
                            className="rounded-lg border px-4 py-2.5 text-sm"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Save Menu Item'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
