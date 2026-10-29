import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PortalLayout from '@/layouts/portal-layout';
import { formatDateTime } from '@/lib/portal';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowRight, LockKeyhole, MapPin, UserRound } from 'lucide-react';
import { FormEvent, useRef } from 'react';
import { type SharedData } from '@/types';

interface ProfileProps {
    profile: {
        name: string;
        email: string;
        phone: string | null;
        created_at: string | null;
    };
    addressCount: number;
}

export default function Profile({ profile, addressCount }: ProfileProps) {
    const { auth } = usePage<SharedData>().props;

    const profileForm = useForm({
        name: profile.name,
        email: profile.email,
        phone: profile.phone ?? '',
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const passwordSection = useRef<HTMLDivElement>(null);

    const submitProfile = (event: FormEvent) => {
        event.preventDefault();
        profileForm.patch(route('portal.profile.update'), { preserveScroll: true });
    };

    const submitPassword = (event: FormEvent) => {
        event.preventDefault();

        passwordForm.put(route('portal.password.update'), {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
            onError: () => passwordSection.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
        });
    };

    return (
        <PortalLayout>
            <Head title="My Profile" />

            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                <span className="inline-flex items-center gap-2 text-[10.5px] font-extrabold tracking-[0.16em] text-brand-dark uppercase">
                    <span className="size-1.5 rounded-full bg-brand" />
                    My account
                </span>
                <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">Profile settings</h1>
                <p className="mt-1.5 text-sm text-warm-muted">
                    Update the details the karinderya uses to contact you about your orders.
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                    <Link
                        href={route('portal.addresses.index')}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-warm-line bg-paper px-3 py-2 text-[11.5px] font-bold transition hover:border-brand"
                    >
                        <MapPin className="size-3.5 text-brand" />
                        Manage addresses
                        {addressCount > 0 && <span className="text-warm-muted">({addressCount})</span>}
                    </Link>
                    <Link
                        href={route('dashboard')}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-warm-line bg-paper px-3 py-2 text-[11.5px] font-bold transition hover:border-brand"
                    >
                        <UserRound className="size-3.5 text-brand" />
                        My account
                    </Link>
                </div>

                <div className="mt-6 space-y-5">
                    <section className="rounded-2xl border border-warm-line bg-paper p-4 sm:p-5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h2 className="text-sm font-extrabold">Personal information</h2>
                            <span className="text-[11px] text-warm-muted">
                                Customer since {formatDateTime(profile.created_at)}
                            </span>
                        </div>

                        <form onSubmit={submitProfile} className="mt-4 grid gap-3.5 sm:grid-cols-2">
                            <div className="grid gap-1.5 sm:col-span-2">
                                <Label htmlFor="name">Full name</Label>
                                <Input
                                    id="name"
                                    value={profileForm.data.name}
                                    onChange={(event) => profileForm.setData('name', event.target.value)}
                                    autoComplete="name"
                                    placeholder="Full name"
                                    required
                                />
                                <InputError message={profileForm.errors.name} />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={profileForm.data.email}
                                    onChange={(event) => profileForm.setData('email', event.target.value)}
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    required
                                />
                                <InputError message={profileForm.errors.email} />
                                <p className="text-[10.5px] text-warm-muted">
                                    Changing your email marks your address as unverified again.
                                </p>
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="phone">Contact number</Label>
                                <Input
                                    id="phone"
                                    value={profileForm.data.phone}
                                    onChange={(event) => profileForm.setData('phone', event.target.value)}
                                    autoComplete="tel"
                                    placeholder="09XX XXX XXXX"
                                />
                                <InputError message={profileForm.errors.phone} />
                            </div>

                            <div className="flex items-center gap-3 sm:col-span-2">
                                <button
                                    type="submit"
                                    disabled={profileForm.processing}
                                    className="rounded-lg bg-brand px-4 py-2.5 text-[12px] font-bold text-white transition hover:bg-brand-dark disabled:opacity-60"
                                >
                                    {profileForm.processing ? 'Saving…' : 'Save changes'}
                                </button>
                                {profileForm.recentlySuccessful && (
                                    <span className="text-[11.5px] font-bold text-emerald-600">Saved</span>
                                )}
                            </div>
                        </form>
                    </section>

                    <section ref={passwordSection} className="rounded-2xl border border-warm-line bg-paper p-4 sm:p-5">
                        <div className="flex items-center gap-2">
                            <LockKeyhole className="size-4 text-brand" />
                            <h2 className="text-sm font-extrabold">Change password</h2>
                        </div>
                        <p className="mt-1 text-[11.5px] text-warm-muted">
                            Use a strong password with at least 8 characters. You will stay signed in after changing it.
                        </p>

                        <form onSubmit={submitPassword} className="mt-4 grid gap-3.5 sm:grid-cols-2">
                            <div className="grid gap-1.5 sm:col-span-2">
                                <Label htmlFor="current_password">Current password</Label>
                                <Input
                                    id="current_password"
                                    type="password"
                                    value={passwordForm.data.current_password}
                                    onChange={(event) => passwordForm.setData('current_password', event.target.value)}
                                    autoComplete="current-password"
                                    required
                                />
                                <InputError message={passwordForm.errors.current_password} />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="password">New password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={passwordForm.data.password}
                                    onChange={(event) => passwordForm.setData('password', event.target.value)}
                                    autoComplete="new-password"
                                    required
                                />
                                <InputError message={passwordForm.errors.password} />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="password_confirmation">Confirm new password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={passwordForm.data.password_confirmation}
                                    onChange={(event) => passwordForm.setData('password_confirmation', event.target.value)}
                                    autoComplete="new-password"
                                    required
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <button
                                    type="submit"
                                    disabled={passwordForm.processing}
                                    className="rounded-lg border border-warm-line bg-paper px-4 py-2.5 text-[12px] font-bold transition hover:border-brand disabled:opacity-60"
                                >
                                    {passwordForm.processing ? 'Updating…' : 'Update password'}
                                </button>
                            </div>
                        </form>
                    </section>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e9d8c6] bg-[#fbf0e3] px-4 py-3.5">
                        <div>
                            <p className="text-[12.5px] font-bold">Signed in as {auth.user?.email}</p>
                            <p className="text-[11px] text-warm-muted">Your orders are private to this account.</p>
                        </div>
                        <Link
                            href={route('orders.index')}
                            className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-brand-dark hover:underline"
                        >
                            My orders
                            <ArrowRight className="size-3" />
                        </Link>
                    </div>
                </div>
            </div>
        </PortalLayout>
    );
}
