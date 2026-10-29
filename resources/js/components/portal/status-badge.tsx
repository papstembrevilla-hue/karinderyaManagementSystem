import { statusClassName, statusLabel } from '@/lib/portal';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
    status: string;
    fulfillment?: string;
    className?: string;
}

export default function StatusBadge({ status, fulfillment, className }: StatusBadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10.5px] font-extrabold tracking-[0.05em] uppercase',
                statusClassName(status),
                className,
            )}
        >
            {statusLabel(status, fulfillment)}
        </span>
    );
}
