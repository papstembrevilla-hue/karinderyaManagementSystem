import { cn } from '@/lib/utils';
import { UtensilsCrossed } from 'lucide-react';
import { useState } from 'react';

const GRADIENTS = [
    'from-amber-300 to-orange-700',
    'from-lime-300 to-green-700',
    'from-yellow-300 to-amber-700',
    'from-orange-300 to-red-700',
    'from-purple-300 to-fuchsia-700',
    'from-teal-300 to-cyan-700',
];

interface FoodImageProps {
    photo: string | null;
    name: string;
    seed?: number;
    className?: string;
}

export default function FoodImage({ photo, name, seed = 0, className }: FoodImageProps) {
    const [failed, setFailed] = useState(false);

    if (photo && !failed) {
        return (
            <img
                src={`/storage/${photo}`}
                alt={name}
                className={cn('h-full w-full object-cover', className)}
                loading="lazy"
                onError={() => setFailed(true)}
            />
        );
    }

    return (
        <div
            aria-label={name}
            className={cn(
                'flex h-full w-full items-center justify-center bg-gradient-to-br',
                GRADIENTS[Math.abs(seed) % GRADIENTS.length],
                className,
            )}
        >
            <div className="grid size-14 place-items-center rounded-full bg-white/25 text-white/90 shadow-inner">
                <UtensilsCrossed className="size-6" aria-hidden="true" />
            </div>
        </div>
    );
}
