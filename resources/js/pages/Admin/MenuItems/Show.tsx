import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface MenuItem {
    id: number;
    name: string;
    description: string | null;
    price: number;
    photo: string | null;
    is_available: boolean;
    category: { id: number; name: string } | null;
}

export default function Show({ menuItem }: { menuItem: MenuItem }) {
    return (
        <AppLayout>
            <Head title={`Menu Item - ${menuItem.name}`} />

            <div className="mx-auto max-w-4xl space-y-6 p-6">
                <Link
                    href="/admin/menu-items"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600"
                >
                    <ArrowLeft size={17} /> Back to Menu Items
                </Link>

                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="grid gap-8 md:grid-cols-2">
                        <div>
                            {menuItem.photo ? (
                                <img
                                    src={`/storage/${menuItem.photo}`}
                                    alt={menuItem.name}
                                    className="h-80 w-full rounded-xl object-cover"
                                />
                            ) : (
                                <div className="flex h-80 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                                    No Photo Available
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold">
                                        {menuItem.name}
                                    </h1>
                                    <p className="text-sm text-gray-500">
                                        {menuItem.category?.name ||
                                            'No category'}
                                    </p>
                                </div>

                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                                        menuItem.is_available
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}
                                >
                                    {menuItem.is_available
                                        ? 'Available'
                                        : 'Unavailable'}
                                </span>
                            </div>

                            <p className="mt-6 text-3xl font-bold text-emerald-700">
                                ₱{Number(menuItem.price).toFixed(2)}
                            </p>

                            <div className="mt-6">
                                <p className="text-sm text-gray-500">
                                    Description
                                </p>
                                <p className="mt-1">
                                    {menuItem.description ||
                                        'No description provided.'}
                                </p>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <Link
                                    href={`/admin/menu-items/${menuItem.id}/edit`}
                                    className="rounded-lg bg-emerald-600 px-5 py-2 text-white hover:bg-emerald-700"
                                >
                                    Edit Menu Item
                                </Link>
                                <Link
                                    href="/admin/menu-items"
                                    className="rounded-lg border px-5 py-2 hover:bg-gray-50"
                                >
                                    Back
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
