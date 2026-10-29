import FlashMessage from '@/components/FlashMessage';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    ClipboardList,
    Home,
    LayoutDashboard,
    LogOut,
    Menu as MenuIcon,
    ShoppingBasket,
    UserRound,
    UtensilsCrossed,
    X,
} from 'lucide-react';
import { ReactNode, useState } from 'react';

interface PortalLayoutProps {
    children: ReactNode;
}

export default function PortalLayout({ children }: PortalLayoutProps) {
    const { auth, brand, cartCount } = usePage<SharedData>().props;
    const { url } = usePage();
    const [open, setOpen] = useState(false);

    const user = auth.user;
    const path = url.split('?')[0];

    const isActive = (href: string) => (href === '/' ? path === '/' : path === href || path.startsWith(`${href}/`));

    const links = [
        { title: 'Home', href: '/' },
        { title: 'Menu', href: '/menu' },
        ...(user?.role === 'user'
            ? [
                  { title: 'My Orders', href: '/orders' },
                  { title: 'My Cart', href: '/cart' },
              ]
            : []),
    ];

    return (
        <div className="flex min-h-screen flex-col bg-cream text-ink">
            <header className="sticky top-0 z-40 border-b border-warm-line bg-cream/95 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6 lg:px-8">
                    <Link href={route('home')} className="flex items-center gap-2.5">
                        <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-dark text-sm font-extrabold text-white shadow-sm">
                            K
                        </span>
                        <span className="leading-tight">
                            <span className="block text-[15px] font-extrabold">{brand}</span>
                            <span className="block text-[9px] tracking-[0.18em] text-warm-muted uppercase">Lutong bahay</span>
                        </span>
                    </Link>

                    <nav className="ml-6 hidden items-center gap-1 md:flex">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`rounded-full px-3.5 py-2 text-[13.5px] font-semibold transition ${
                                    isActive(link.href)
                                        ? 'bg-[#fdeBdd] text-brand-dark'
                                        : 'text-warm-muted hover:bg-warm-soft hover:text-ink'
                                }`}
                            >
                                {link.title}
                            </Link>
                        ))}
                    </nav>

                    <div className="ml-auto flex items-center gap-2">
                        {user?.role === 'user' && (
                            <Link
                                href={route('cart.index')}
                                aria-label="Open cart"
                                className="relative grid size-10 place-items-center rounded-full border border-warm-line bg-paper transition hover:border-brand"
                            >
                                <ShoppingBasket className="size-4 text-warm-muted" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 grid min-w-[18px] place-items-center rounded-full border-2 border-cream bg-brand px-1 text-[10px] font-extrabold text-white">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        {user ? (
                            <>
                                {user.role === 'admin' && (
                                    <Link
                                        href={route('admin.dashboard')}
                                        className="hidden items-center gap-1.5 rounded-full border border-warm-line bg-paper px-3.5 py-2 text-xs font-bold text-warm-muted transition hover:border-brand hover:text-brand-dark sm:flex"
                                    >
                                        <LayoutDashboard className="size-3.5" />
                                        Admin dashboard
                                    </Link>
                                )}

                                {user.role === 'user' && (
                                    <Link
                                        href={route('portal.profile.edit')}
                                        className="hidden items-center gap-2 rounded-full border border-warm-line bg-paper py-1.5 pr-3 pl-1.5 sm:flex"
                                    >
                                        <span className="grid size-7 place-items-center rounded-full bg-[#f0d9c2] text-[11px] font-extrabold text-[#6b3b1e]">
                                            {user.name.slice(0, 1).toUpperCase()}
                                        </span>
                                        <span className="max-w-[120px] truncate text-xs font-bold">{user.name}</span>
                                    </Link>
                                )}

                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    aria-label="Log out"
                                    className="grid size-10 place-items-center rounded-full border border-warm-line bg-paper text-warm-muted transition hover:border-red-200 hover:text-red-600"
                                >
                                    <LogOut className="size-4" />
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="rounded-full px-3.5 py-2 text-[13px] font-bold text-warm-muted transition hover:text-ink"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="rounded-full bg-brand px-4 py-2 text-[13px] font-bold text-white shadow-sm transition hover:bg-brand-dark"
                                >
                                    Register
                                </Link>
                            </>
                        )}

                        <button
                            type="button"
                            onClick={() => setOpen((value) => !value)}
                            aria-label={open ? 'Close menu' : 'Open menu'}
                            aria-expanded={open}
                            className="grid size-10 place-items-center rounded-full border border-warm-line bg-paper text-ink md:hidden"
                        >
                            {open ? <X className="size-5" /> : <MenuIcon className="size-5" />}
                        </button>
                    </div>
                </div>

                {open && (
                    <div className="border-t border-warm-line bg-cream px-4 py-3 md:hidden">
                        <nav className="flex flex-col gap-1">
                            {links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setOpen(false)}
                                    className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                                        isActive(link.href) ? 'bg-[#fdeBdd] text-brand-dark' : 'text-warm-muted'
                                    }`}
                                >
                                    {link.href === '/cart' ? (
                                        <ShoppingBasket className="size-4" />
                                    ) : link.href === '/orders' ? (
                                        <ClipboardList className="size-4" />
                                    ) : link.href === '/menu' ? (
                                        <UtensilsCrossed className="size-4" />
                                    ) : (
                                        <Home className="size-4" />
                                    )}
                                    {link.title}
                                </Link>
                            ))}
                            {user?.role === 'user' && (
                                <Link
                                    href={route('portal.profile.edit')}
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-warm-muted"
                                >
                                    <UserRound className="size-4" />
                                    My Profile
                                </Link>
                            )}
                            {user?.role === 'admin' && (
                                <Link
                                    href={route('admin.dashboard')}
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-warm-muted"
                                >
                                    <LayoutDashboard className="size-4" />
                                    Admin dashboard
                                </Link>
                            )}
                            {!user && (
                                <div className="mt-1 flex gap-2">
                                    <Link
                                        href={route('login')}
                                        onClick={() => setOpen(false)}
                                        className="flex-1 rounded-lg border border-warm-line px-3 py-2 text-center text-sm font-bold"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        onClick={() => setOpen(false)}
                                        className="flex-1 rounded-lg bg-brand px-3 py-2 text-center text-sm font-bold text-white"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                        </nav>
                    </div>
                )}
            </header>

            <FlashMessage />

            <main className="flex-1">{children}</main>

            <footer className="mt-12 bg-[#2b1b12] text-[#f8e9d9]">
                <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                    <div>
                        <p className="text-sm font-extrabold">{brand}</p>
                        <p className="text-[11px] text-[#cdb6a1]">Lutong bahay · Pickup and delivery</p>
                    </div>
                    <p className="max-w-sm text-[11px] text-[#cdb6a1]">
                        Menu, prices, and availability are checked against the store's database when your order is placed.
                    </p>
                </div>
            </footer>
        </div>
    );
}
