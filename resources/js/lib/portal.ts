export function formatPeso(value: string | number | null | undefined): string {
    const amount = Number(value ?? 0);

    return `₱${amount.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

export function formatDateTime(value: string | null | undefined): string {
    if (!value) return '—';

    return new Date(value).toLocaleString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

export const STATUS_META: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    confirmed: { label: 'Confirmed', className: 'bg-sky-50 text-sky-700 border-sky-200' },
    preparing: { label: 'Preparing', className: 'bg-orange-50 text-orange-700 border-orange-200' },
    ready: { label: 'Ready', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    cancelled: { label: 'Cancelled', className: 'bg-red-50 text-red-700 border-red-200' },
};

export const ORDER_STEPS = ['pending', 'confirmed', 'preparing', 'ready', 'completed'] as const;

export function statusLabel(status: string, fulfillment?: string): string {
    if (status === 'ready') {
        return fulfillment === 'delivery' ? 'Out for delivery' : 'Ready for pickup';
    }

    return STATUS_META[status]?.label ?? status;
}

export function statusClassName(status: string): string {
    return STATUS_META[status]?.className ?? 'bg-neutral-50 text-neutral-600 border-neutral-200';
}

export function stepLabel(status: string, fulfillment?: string): string {
    if (status === 'ready') {
        return fulfillment === 'delivery' ? 'Out for delivery' : 'Ready';
    }

    return STATUS_META[status]?.label ?? status;
}

export function paymentStatusLabel(status: string): string {
    return status === 'paid' ? 'Paid' : 'Unpaid';
}

export function fulfillmentLabel(method: string): string {
    return method === 'delivery' ? 'Delivery' : 'Pickup';
}
