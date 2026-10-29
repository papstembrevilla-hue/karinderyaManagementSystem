import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PortalLayout from '@/layouts/portal-layout';
import { type Address } from '@/types/portal';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, MapPin, Pencil, Plus, Trash2, X } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface AddressesProps {
    addresses: Address[];
}

const emptyAddress = {
    label: '',
    recipient_name: '',
    phone: '',
    address: '',
    is_default: false,
};

export default function Addresses({ addresses }: AddressesProps) {
    const [editing, setEditing] = useState<Address | null>(null);
    const [formOpen, setFormOpen] = useState(addresses.length === 0);

    const form = useForm({ ...emptyAddress });

    const startCreate = () => {
        setEditing(null);
        form.setData({ ...emptyAddress });
        form.clearErrors();
        setFormOpen(true);
    };

    const startEdit = (address: Address) => {
        setEditing(address);
        form.setData({
            label: address.label ?? '',
            recipient_name: address.recipient_name,
            phone: address.phone,
            address: address.address,
            is_default: address.is_default,
        });
        form.clearErrors();
        setFormOpen(true);
    };

    const cancelForm = () => {
        setEditing(null);
        setFormOpen(false);
        form.reset();
        form.clearErrors();
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setEditing(null);
                setFormOpen(false);
                form.reset();
            },
        };

        if (editing) {
            form.put(route('portal.addresses.update', editing.id), options);
        } else {
            form.post(route('portal.addresses.store'), options);
        }
    };

    const remove = (address: Address) => {
        if (!window.confirm(`Remove the address for ${address.recipient_name}?`)) return;

        router.delete(route('portal.addresses.destroy', address.id), { preserveScroll: true });
    };

    return (
        <PortalLayout>
            <Head title="My Addresses" />

            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                <Link
                    href={route('portal.profile.edit')}
                    className="inline-flex items-center gap-1.5 text-[12px] font-bold text-warm-muted transition hover:text-brand-dark"
                >
                    <ArrowLeft className="size-3.5" />
                    Back to profile
                </Link>

                <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <span className="inline-flex items-center gap-2 text-[10.5px] font-extrabold tracking-[0.16em] text-brand-dark uppercase">
                            <span className="size-1.5 rounded-full bg-brand" />
                            Delivery
                        </span>
                        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">My addresses</h1>
                        <p className="mt-1.5 text-sm text-warm-muted">
                            Save the places you order to most often so checkout takes seconds.
                        </p>
                    </div>

                    {!formOpen && (
                        <button
                            type="button"
                            onClick={startCreate}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-[12px] font-bold text-white transition hover:bg-brand-dark"
                        >
                            <Plus className="size-3.5" />
                            Add address
                        </button>
                    )}
                </div>

                {formOpen && (
                    <form onSubmit={submit} className="mt-5 rounded-2xl border border-warm-line bg-paper p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <h2 className="text-sm font-extrabold">{editing ? 'Edit address' : 'New address'}</h2>
                                <p className="mt-0.5 text-[11px] text-warm-muted">
                                    Only you can see and use the addresses saved here.
                                </p>
                            </div>
                            {addresses.length > 0 && (
                                <button
                                    type="button"
                                    onClick={cancelForm}
                                    aria-label="Close address form"
                                    className="grid size-8 place-items-center rounded-full border border-warm-line text-warm-muted transition hover:border-red-200 hover:text-red-600"
                                >
                                    <X className="size-4" />
                                </button>
                            )}
                        </div>

                        <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
                            <div className="grid gap-1.5">
                                <Label htmlFor="label">Label</Label>
                                <Input
                                    id="label"
                                    value={form.data.label}
                                    onChange={(event) => form.setData('label', event.target.value)}
                                    placeholder="Home, Work, etc."
                                    maxLength={50}
                                />
                                <InputError message={form.errors.label} />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="recipient_name">Recipient name</Label>
                                <Input
                                    id="recipient_name"
                                    value={form.data.recipient_name}
                                    onChange={(event) => form.setData('recipient_name', event.target.value)}
                                    placeholder="Who receives the order?"
                                    autoComplete="name"
                                    required
                                />
                                <InputError message={form.errors.recipient_name} />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="phone">Contact number</Label>
                                <Input
                                    id="phone"
                                    value={form.data.phone}
                                    onChange={(event) => form.setData('phone', event.target.value)}
                                    placeholder="09XX XXX XXXX"
                                    autoComplete="tel"
                                    required
                                />
                                <InputError message={form.errors.phone} />
                            </div>

                            <div className="grid gap-1.5 sm:col-span-2">
                                <Label htmlFor="address">Complete address</Label>
                                <textarea
                                    id="address"
                                    value={form.data.address}
                                    onChange={(event) => form.setData('address', event.target.value)}
                                    rows={2}
                                    required
                                    placeholder="House number, street, barangay, landmark"
                                    className="w-full rounded-lg border border-warm-line bg-paper px-3 py-2 text-sm outline-none focus:border-brand"
                                />
                                <InputError message={form.errors.address} />
                            </div>

                            <label className="flex items-center gap-2 text-[12px] font-semibold sm:col-span-2">
                                <input
                                    type="checkbox"
                                    checked={form.data.is_default}
                                    onChange={(event) => form.setData('is_default', event.target.checked)}
                                    className="size-4 rounded border-warm-line accent-brand"
                                />
                                Use as my default delivery address
                            </label>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="rounded-lg bg-brand px-4 py-2.5 text-[12px] font-bold text-white transition hover:bg-brand-dark disabled:opacity-60"
                            >
                                {form.processing ? 'Saving…' : editing ? 'Save address' : 'Add address'}
                            </button>
                            {addresses.length > 0 && (
                                <button
                                    type="button"
                                    onClick={cancelForm}
                                    className="rounded-lg border border-warm-line px-4 py-2.5 text-[12px] font-bold text-warm-muted transition hover:border-brand"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                )}

                {addresses.length === 0 ? (
                    !formOpen && (
                        <div className="mt-6 rounded-2xl border border-dashed border-[#dcc9b4] bg-paper px-6 py-12 text-center">
                            <div className="mx-auto grid size-12 place-items-center rounded-full border border-[#f0e0cc] bg-[#fbf0e3]">
                                <MapPin className="size-5 text-brand" />
                            </div>
                            <p className="mt-3 text-[13px] font-bold">No saved addresses</p>
                            <p className="mt-0.5 text-[11.5px] text-warm-muted">
                                You can also type your address at checkout without saving it.
                            </p>
                        </div>
                    )
                ) : (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {addresses.map((address) => (
                            <article
                                key={address.id}
                                className={`rounded-2xl border bg-paper p-4 ${
                                    address.is_default ? 'border-brand/40 shadow-sm' : 'border-warm-line'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <h2 className="text-[12.5px] font-extrabold">{address.label}</h2>
                                        {address.is_default && (
                                            <span className="rounded-full bg-[#fdeBdd] px-2 py-0.5 text-[9.5px] font-extrabold tracking-[0.06em] text-brand-dark uppercase">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex shrink-0 gap-1">
                                        <button
                                            type="button"
                                            onClick={() => startEdit(address)}
                                            aria-label={`Edit ${address.label} address`}
                                            className="grid size-7 place-items-center rounded-md border border-warm-line text-warm-muted transition hover:border-brand hover:text-brand-dark"
                                        >
                                            <Pencil className="size-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => remove(address)}
                                            aria-label={`Remove ${address.label} address`}
                                            className="grid size-7 place-items-center rounded-md border border-warm-line text-warm-muted transition hover:border-red-200 hover:text-red-600"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-2 space-y-0.5 text-[11.5px] text-warm-muted">
                                    <p className="font-bold text-ink">{address.recipient_name}</p>
                                    <p>{address.phone}</p>
                                    <p>{address.address}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </PortalLayout>
    );
}
