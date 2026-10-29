import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface Flash {
    success?: string;
    error?: string;
}

interface PageProps {
    flash?: Flash;
    [key: string]: unknown;
}

export default function FlashMessage() {
    const { flash } = usePage<PageProps>().props;

    const message = flash?.success || flash?.error;
    const type = flash?.error ? 'error' : 'success';

    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!message) {
            setVisible(false);
            return;
        }

        setVisible(true);

        const timer = setTimeout(() => {
            setVisible(false);
        }, 4000);

        return () => clearTimeout(timer);
    }, [message]);

    if (!visible || !message) {
        return null;
    }

    return (
        <div
            className={`fixed right-5 top-5 z-[9999] flex min-w-[320px] items-center gap-3 rounded-lg border px-4 py-3 shadow-lg ${
                type === 'success'
                    ? 'border-green-200 bg-green-50 text-green-800'
                    : 'border-red-200 bg-red-50 text-red-800'
            }`}
        >
            {/* Icon */}
            {type === 'success' ? (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 font-bold text-white">
                    ✓
                </div>
            ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 font-bold text-white">
                    ×
                </div>
            )}

            {/* Message */}
            <span className="flex-1 text-sm font-medium">
                {message}
            </span>

            {/* Close Button */}
            <button
                type="button"
                onClick={() => setVisible(false)}
                className="text-gray-400 transition hover:text-gray-700"
            >
                ✕
            </button>
        </div>
    );
}