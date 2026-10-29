import { type Paginated } from '@/types/portal';
import { Link } from '@inertiajs/react';

interface PortalPaginationProps {
    paginator: Pick<Paginated<unknown>, 'links' | 'from' | 'to' | 'total'>;
    className?: string;
}

export default function PortalPagination({ paginator, className }: PortalPaginationProps) {
    if (paginator.total === 0 || paginator.links.length <= 3) {
        return null;
    }

    return (
        <div className={className}>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
                {paginator.links.map((link, index) => {
                    const label = link.label.replace('&laquo;', '‹').replace('&raquo;', '›');

                    if (!link.url) {
                        return (
                            <span
                                key={index}
                                className="rounded-lg border border-warm-line px-3 py-1.5 text-xs font-semibold text-warm-muted/50"
                                dangerouslySetInnerHTML={{ __html: label }}
                            />
                        );
                    }

                    return (
                        <Link
                            key={index}
                            href={link.url}
                            preserveScroll
                            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                                link.active
                                    ? 'border-brand bg-brand text-white'
                                    : 'border-warm-line bg-paper text-warm-muted hover:border-brand hover:text-brand-dark'
                            }`}
                            dangerouslySetInnerHTML={{ __html: label }}
                        />
                    );
                })}
            </div>

            <p className="mt-3 text-center text-[11.5px] text-warm-muted">
                Showing {paginator.from ?? 0}–{paginator.to ?? 0} of {paginator.total}
            </p>
        </div>
    );
}
