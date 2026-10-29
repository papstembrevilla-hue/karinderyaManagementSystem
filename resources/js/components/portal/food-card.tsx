import FoodImage from '@/components/portal/food-image';
import { formatPeso } from '@/lib/portal';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { type MenuItem } from '@/types/portal';
import { Link, router, usePage } from '@inertiajs/react';
import { LoaderCircle, Plus } from 'lucide-react';
import { useState } from 'react';

interface FoodCardProps {
    item: MenuItem;
    compact?: boolean;
}

export default function FoodCard({ item, compact = false }: FoodCardProps) {
    const { auth } = usePage<SharedData>().props;
    const [adding, setAdding] = useState(false);

    const canOrder = auth.user?.role === 'user';

    const addToCart = () => {
        router.post(
            route('cart.store'),
            { menu_item_id: item.id, quantity: 1 },
            {
                preserveScroll: true,
                onStart: () => setAdding(true),
                onFinish: () => setAdding(false),
            },
        );
    };

    return (
        <article className="group flex flex-col overflow-hidden rounded-2xl border border-warm-line bg-paper transition hover:-translate-y-0.5 hover:border-[#dfc7b0] hover:shadow-lg hover:shadow-ink/5">
            <Link
                href={route('menu.show', item.id)}
                className={cn('relative block overflow-hidden', compact ? 'h-28' : 'h-36')}
            >
                <FoodImage photo={item.photo} name={item.name} seed={item.id} />
                {!item.is_available && (
                    <div className="absolute inset-0 grid place-items-center bg-ink/40">
                        <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold tracking-[0.08em] text-warm-muted uppercase">
                            Sold out
                        </span>
                    </div>
                )}
            </Link>

            <div className="flex flex-1 flex-col p-3.5">
                <span className="text-[10px] font-extrabold tracking-[0.1em] text-brand-dark uppercase">
                    {item.category?.name ?? 'Uncategorized'}
                </span>

                <Link href={route('menu.show', item.id)} className="mt-1">
                    <h3 className="text-[14.5px] leading-snug font-bold hover:text-brand-dark">{item.name}</h3>
                </Link>

                <p className="mt-1 line-clamp-2 flex-1 text-[11.5px] text-warm-muted">
                    {item.description ?? 'Freshly prepared in our kitchen.'}
                </p>

                <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-[15px] font-extrabold tracking-tight">{formatPeso(item.price)}</span>

                    {item.is_available ? (
                        canOrder ? (
                            <button
                                type="button"
                                onClick={addToCart}
                                disabled={adding}
                                aria-label={`Add ${item.name} to cart`}
                                className="grid size-8 place-items-center rounded-lg bg-brand text-white transition hover:bg-brand-dark disabled:opacity-60"
                            >
                                {adding ? <LoaderCircle className="size-4 animate-spin" /> : <Plus className="size-4" />}
                            </button>
                        ) : auth.user ? (
                            <span className="text-[10px] font-semibold text-warm-muted">Admin view</span>
                        ) : (
                            <Link
                                href={route('login')}
                                aria-label={`Log in to order ${item.name}`}
                                className="grid size-8 place-items-center rounded-lg bg-brand text-white transition hover:bg-brand-dark"
                            >
                                <Plus className="size-4" />
                            </Link>
                        )
                    ) : (
                        <span className="text-[10px] font-semibold text-warm-muted">Unavailable</span>
                    )}
                </div>
            </div>
        </article>
    );
}
