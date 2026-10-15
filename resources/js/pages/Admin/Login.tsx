import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

export default function AdminLogin() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();

        post('/admin-login');
    };

    return (
        <>
            <Head title="Admin Login" />

            <div className="min-h-screen flex items-center justify-center">
                <form
                    onSubmit={submit}
                    className="w-full max-w-md space-y-4"
                >
                    <h1 className="text-2xl font-bold">
                        Administrator Login
                    </h1>

                    <input
                        type="email"
                        placeholder="Admin Email"
                        value={data.email}
                        onChange={(e) =>
                            setData('email', e.target.value)
                        }
                        className="w-full border p-2"
                    />

                    {errors.email && (
                        <p className="text-red-500">{errors.email}</p>
                    )}

                    <input
                        type="password"
                        placeholder="Password"
                        value={data.password}
                        onChange={(e) =>
                            setData('password', e.target.value)
                        }
                        className="w-full border p-2"
                    />

                    {errors.password && (
                        <p className="text-red-500">{errors.password}</p>
                    )}

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-black text-white p-2"
                    >
                        {processing ? 'Logging in...' : 'Admin Login'}
                    </button>
                </form>
            </div>
        </>
    );
}