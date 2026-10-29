import FoodCard from '@/components/portal/food-card';
import PortalLayout from '@/layouts/portal-layout';
import { type SharedData } from '@/types';
import { type Category, type MenuItem } from '@/types/portal';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowRight, Search, Timer, Truck, UtensilsCrossed, Wallet } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface HomeProps {
    categories: Category[];
    menuItems: MenuItem[];
}

export default function Home({ categories, menuItems }: HomeProps) {
    const { brand, auth } = usePage<SharedData>().props;
    const [search, setSearch] = useState('');

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();
        router.get(route('menu.index'), search.trim() ? { q: search.trim() } : {});
    };

    return (
        <PortalLayout>
            <Head title="Home" />

            <section className="relative overflow-hidden border-b border-warm-line">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_320px_at_82%_15%,#ffe2c2_0%,rgba(255,226,194,0)_62%),radial-gradient(460px_280px_at_8%_90%,#fbe7cf_0%,rgba(251,231,207,0)_65%),linear-gradient(180deg,#fff9f2_0%,#fdf3e7_100%)]" />

                <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-8 lg:py-16">
                    <div>
                        <span className="inline-flex items-center gap-2 text-[10.5px] font-extrabold tracking-[0.16em] text-brand-dark uppercase">
                            <span className="size-1.5 rounded-full bg-brand" />
                            Order from our kitchen
                        </span>

                        <h1 className="mt-3 max-w-xl font-serif text-4xl leading-[1.04] font-semibold tracking-tight sm:text-5xl lg:text-[54px]">
                            Lutong bahay,{' '}
                            <em className="text-brand-dark italic">ready when you are.</em>
                        </h1>

                        <p className="mt-4 max-w-lg text-[15px] text-warm-muted">
                            Browse what the kitchen has today, add it to your cart, and choose pickup or delivery.
                            Prices and availability are verified again when you place the order.
                        </p>

                        <div className="mt-6 flex flex-wrap gap-2.5">
                            <Link
                                href={route('menu.index')}
                                className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand/20 transition hover:bg-brand-dark"
                            >
                                Browse the menu
                                <ArrowRight className="size-4" />
                            </Link>
                            {auth.user?.role === 'user' ? (
                                <Link
                                    href={route('cart.index')}
                                    className="inline-flex items-center gap-2 rounded-xl border border-[#dccbbb] bg-white/60 px-5 py-3 text-sm font-bold transition hover:bg-white"
                                >
                                    View my cart
                                </Link>
                            ) : !auth.user ? (
                                <Link
                                    href={route('register')}
                                    className="inline-flex items-center gap-2 rounded-xl border border-[#dccbbb] bg-white/60 px-5 py-3 text-sm font-bold transition hover:bg-white"
                                >
                                    Create an account
                                </Link>
                            ) : null}
                        </div>

                        <dl className="mt-8 flex flex-wrap gap-x-7 gap-y-3 border-t border-dashed border-[#dcc9b4] pt-5">
                            <div>
                                <dt className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.1em] text-warm-muted uppercase">
                                    <Timer className="size-3.5" /> Pickup
                                </dt>
                                <dd className="text-sm font-bold">Prepared to order</dd>
                            </div>
                            <div>
                                <dt className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.1em] text-warm-muted uppercase">
                                    <Truck className="size-3.5" /> Delivery
                                </dt>
                                <dd className="text-sm font-bold">Within the store's area</dd>
                            </div>
                            <div>
                                <dt className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.1em] text-warm-muted uppercase">
                                    <Wallet className="size-3.5" /> Payment
                                </dt>
                                <dd className="text-sm font-bold">Cash or GCash</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="relative mx-auto hidden min-h-[330px] w-full max-w-md lg:block" aria-hidden="true">
                        <div className="absolute inset-4 rounded-full border border-[#f1ddc4] bg-[radial-gradient(circle_at_38%_30%,#ffffff_0%,#fff7ec_46%,#f4e2cc_72%,#ead3b8_100%)] shadow-[0_30px_60px_rgba(120,72,30,0.18)]">
                            <div className="absolute inset-[22%] rounded-full border border-dashed border-[#dec7ab]" />
                            <div className="absolute top-[22%] left-[24%] size-[38%] rounded-full bg-[radial-gradient(circle_at_35%_30%,#e9a45c,#a8521f_70%)] shadow-[inset_-8px_-10px_20px_rgba(0,0,0,0.12),0_10px_18px_rgba(120,72,30,0.15)]" />
                            <div className="absolute top-[34%] right-[17%] size-[26%] rounded-full bg-[radial-gradient(circle_at_35%_30%,#f6d27a,#d08a22_72%)] shadow-[inset_-8px_-10px_20px_rgba(0,0,0,0.12),0_10px_18px_rgba(120,72,30,0.15)]" />
                            <div className="absolute bottom-[16%] left-[30%] size-[30%] rounded-full bg-[radial-gradient(circle_at_35%_30%,#b8d48a,#5e8c3a_72%)] shadow-[inset_-8px_-10px_20px_rgba(0,0,0,0.12),0_10px_18px_rgba(120,72,30,0.15)]" />
                            <div className="absolute right-[22%] bottom-[22%] size-[15%] rounded-full bg-[radial-gradient(circle_at_35%_30%,#f3b6a0,#c4573a_72%)] shadow-[inset_-8px_-10px_20px_rgba(0,0,0,0.12),0_10px_18px_rgba(120,72,30,0.15)]" />
                        </div>

                        <div className="absolute right-0 bottom-0 rounded-2xl border border-warm-line bg-white/90 px-4 py-3 shadow-xl shadow-ink/10 backdrop-blur">
                            <p className="text-xs font-extrabold">Fresh off the stove</p>
                            <p className="text-[11px] text-warm-muted">Menu updated by the kitchen</p>
                            <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[9.5px] font-extrabold tracking-[0.08em] text-emerald-700 uppercase">
                                Available now
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="mx-auto max-w-6xl px-4 py-9 sm:px-6 lg:px-8">
                <form onSubmit={submitSearch} className="flex flex-col gap-2 rounded-2xl border border-warm-line bg-paper p-2 sm:flex-row sm:items-center">
                    <div className="flex flex-1 items-center gap-2 px-2">
                        <Search className="size-4 text-warm-muted" />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search food by name…"
                            aria-label="Search food by name"
                            className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-[#ae9c8b]"
                        />
                    </div>
                    <button
                        type="submit"
                        className="rounded-xl bg-ink px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#3d281b]"
                    >
                        Search menu
                    </button>
                </form>

                {categories.length > 0 && (
                    <section className="pt-8">
                        <div className="mb-3.5 flex items-end justify-between gap-4">
                            <div>
                                <h2 className="font-serif text-2xl font-semibold tracking-tight">Browse by category</h2>
                                <p className="text-xs text-warm-muted">Categories come from the store's menu records.</p>
                            </div>
                            <Link href={route('menu.index')} className="text-xs font-extrabold whitespace-nowrap text-brand-dark">
                                See all items
                            </Link>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {categories.map((category) => (
                                <Link
                                    key={category.id}
                                    href={route('menu.index', { category: category.id })}
                                    className="flex items-center gap-2 rounded-full border border-warm-line bg-paper py-2 pr-4 pl-2 text-xs font-bold transition hover:border-[#e9b78f] hover:bg-[#fff1e4]"
                                >
                                    <span className="grid size-6 place-items-center rounded-full bg-[#f7d9b8] text-[9px] font-extrabold text-[#7a3e1a]">
                                        {category.name.slice(0, 2).toUpperCase()}
                                    </span>
                                    {category.name}
                                    <span className="text-[10px] font-semibold text-warm-muted">
                                        {category.available_items_count ?? 0}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                <section className="pt-8">
                    <div className="mb-3.5 flex items-end justify-between gap-4">
                        <div>
                            <h2 className="font-serif text-2xl font-semibold tracking-tight">Available today</h2>
                            <p className="text-xs text-warm-muted">Only dishes marked available by the administrator are shown.</p>
                        </div>
                        <Link href={route('menu.index')} className="text-xs font-extrabold whitespace-nowrap text-brand-dark">
                            Full menu
                        </Link>
                    </div>

                    {menuItems.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-[#dcc9b4] bg-paper px-6 py-12 text-center">
                            <div className="mx-auto grid size-14 place-items-center rounded-full border border-[#f0e0cc] bg-[#fbf0e3]">
                                <UtensilsCrossed className="size-6 text-brand" />
                            </div>
                            <h3 className="mt-3 text-base font-bold">The menu is empty right now</h3>
                            <p className="mx-auto mt-1 max-w-md text-xs text-warm-muted">
                                {auth.user?.role === 'admin'
                                    ? 'Add categories and menu items in the admin dashboard, then they will appear here.'
                                    : 'The kitchen has not published any dishes yet. Please check back soon.'}
                            </p>
                            {auth.user?.role === 'admin' && (
                                <Link
                                    href={route('admin.menu-items.index')}
                                    className="mt-4 inline-flex rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white"
                                >
                                    Manage menu items
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
                            {menuItems.map((item) => (
                                <FoodCard key={item.id} item={item} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </PortalLayout>
    );
}
