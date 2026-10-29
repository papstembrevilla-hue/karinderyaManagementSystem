import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { FormEvent } from 'react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        is_active: true as boolean,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/categories');
    };

    return (
        <AppLayout>
            <Head title="Add Category" />

            <div className="mx-auto max-w-3xl space-y-6 p-6">
                <Link
                    href="/admin/categories"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600"
                >
                    <ArrowLeft size={17} /> Back to Categories
                </Link>

                <div>
                    <h1 className="text-2xl font-bold">Add Category</h1>
                    <p className="text-sm text-gray-500">
                        Create a category for your menu items.
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-5 rounded-xl border bg-white p-6 shadow-sm"
                >
                    <div>
                        <label className="mb-1.5 block text-sm font-medium">
                            Name *
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Rice Meals, Beverages"
                            className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-indigo-400"
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.name}
                            </p>
                        )}
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
                            className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-indigo-400"
                        />
                        {errors.description && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.description}
                            </p>
                        )}
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(e) =>
                                setData('is_active', e.target.checked)
                            }
                            className="accent-indigo-600"
                        />
                        Active category
                    </label>

                    <div className="flex justify-end gap-3 border-t pt-5">
                        <Link
                            href="/admin/categories"
                            className="rounded-lg border px-4 py-2.5 text-sm"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Save Category'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
