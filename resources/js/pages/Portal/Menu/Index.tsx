import FoodCard from '@/components/portal/food-card';
import PortalPagination from '@/components/portal/pagination';
import PortalLayout from '@/layouts/portal-layout';
import { type Category, type MenuItem, type Paginated } from '@/types/portal';
import { Head, Link, router } from '@inertiajs/react';
import { Search, SlidersHorizontal, UtensilsCrossed } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

interface MenuIndexProps {
    menuItems: Paginated<MenuItem>;
    categories: Category[];
    filters: {
        q: string;
        category: string | number;
        available: boolean;
    };
}

export default function MenuIndex({ menuItems, categories, filters }: MenuIndexProps) {
    const [search, setSearch] = useState(filters.q ?? '');

    useEffect(() => {
        setSearch(filters.q ?? '');
    }, [filters.q]);

    const applyFilters = (overrides: Record<string, string | number | boolean | undefined> = {}) => {
        const params: Record<string, string | number | boolean> = {
            ...(filters.q ? { q: filters.q } : {}),
            ...(filters.category ? { category: filters.category } : {}),
            ...(filters.available ? { available: 1 } : {}),
            ...overrides,
        };

        Object.keys(params).forEach((key) => {
            if (params[key] === '' || params[key] === undefined) delete params[key];
        });

        router.get(route('menu.index'), params, { preserveState: true, preserveScroll: true });
    };

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();
        applyFilters({ q: search.trim() || undefined });
    };

    const hasFilters = filters.q !== '' || Boolean(filters.category) || filters.available;

    return (
        <PortalLayout>
            <Head title="Menu" />

            <div className="mx-auto max-w-6xl px-4 pt-8 pb-4 sm:px-6 lg:px-8">
                <span className="inline-flex items-center gap-2 text-[10.5px] font-extrabold tracking-[0.16em] text-brand-dark uppercase">
                    <span className="size-1.5 rounded-full bg-brand" />
                    Full menu
                </span>
                <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">What's cooking today</h1>
                <p className="mt-1.5 max-w-2xl text-sm text-warm-muted">
                    Search by name or filter by category. Sold-out dishes stay visible but cannot be ordered.
                </p>

                <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-warm-line bg-paper p-2.5">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                        <form onSubmit={submitSearch} className="flex flex-1 items-center gap-2 px-1.5">
                            <Search className="size-4 text-warm-muted" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search food by name…"
                                aria-label="Search food by name"
                                className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-[#ae9c8b]"
                            />
                            <button type="submit" className="rounded-lg bg-ink px-3 py-1.5 text-[11px] font-bold text-white">
                                Search
                            </button>
                        </form>

                        <button
                            type="button"
                            onClick={() => applyFilters({ available: filters.available ? undefined : 1 })}
                            className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[11.5px] font-bold transition ${
                                filters.available
                                    ? 'border-brand bg-[#fff1e4] text-brand-dark'
                                    : 'border-warm-line text-warm-muted hover:border-brand'
                            }`}
                        >
                            <SlidersHorizontal className="size-3.5" />
                            Available only
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 border-t border-warm-soft pt-2.5">
                        <Link
                            href={route('menu.index', {
                                ...(filters.q ? { q: filters.q } : {}),
                                ...(filters.available ? { available: 1 } : {}),
                            })}
                            preserveScroll
                            className={`rounded-full px-3 py-1.5 text-[11.5px] font-bold transition ${
                                !filters.category ? 'bg-ink text-white' : 'text-warm-muted hover:bg-warm-soft'
                            }`}
                        >
                            All
                        </Link>

                        {categories.map((category) => {
                            const active = String(filters.category) === String(category.id);

                            return (
                                <Link
                                    key={category.id}
                                    href={route('menu.index', {
                                        ...(filters.q ? { q: filters.q } : {}),
                                        ...(filters.available ? { available: 1 } : {}),
                                        category: category.id,
                                    })}
                                    preserveScroll
                                    className={`rounded-full px-3 py-1.5 text-[11.5px] font-bold transition ${
                                        active ? 'bg-ink text-white' : 'text-warm-muted hover:bg-warm-soft'
                                    }`}
                                >
                                    {category.name}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {menuItems.data.length === 0 ? (
                    <div className="mt-6 rounded-2xl border border-dashed border-[#dcc9b4] bg-paper px-6 py-14 text-center">
                        <div className="mx-auto grid size-14 place-items-center rounded-full border border-[#f0e0cc] bg-[#fbf0e3]">
                            <UtensilsCrossed className="size-6 text-brand" />
                        </div>
                        <h2 className="mt-3 text-base font-bold">
                            {hasFilters ? 'No dishes match your filters' : 'No dishes are available yet'}
                        </h2>
                        <p className="mx-auto mt-1 max-w-md text-xs text-warm-muted">
                            {hasFilters
                                ? 'Try a different name or category, or clear the filters to see the full menu.'
                                : 'The kitchen has not published any dishes. Please check back soon.'}
                        </p>
                        {hasFilters && (
                            <Link
                                href={route('menu.index')}
                                className="mt-4 inline-flex rounded-xl border border-warm-line bg-white px-4 py-2 text-xs font-bold transition hover:border-brand"
                            >
                                Clear filters
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
                            {menuItems.data.map((item) => (
                                <FoodCard key={item.id} item={item} />
                            ))}
                        </div>

                        <PortalPagination paginator={menuItems} className="mt-8" />
                    </>
                )}
            </div>
        </PortalLayout>
    );
}
