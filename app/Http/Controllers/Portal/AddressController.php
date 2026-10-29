<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\StoreAddressRequest;
use App\Http\Requests\Portal\UpdateAddressRequest;
use App\Models\Address;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AddressController extends Controller
{
    public function index(Request $request): Response
    {
        $addresses = $request->user()
            ->addresses()
            ->orderByDesc('is_default')
            ->orderBy('id')
            ->get();

        return Inertia::render('Portal/Addresses', [
            'addresses' => $addresses,
        ]);
    }

    public function store(StoreAddressRequest $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validated();

        DB::transaction(function () use ($user, $data) {
            $makeDefault = (bool) ($data['is_default'] ?? false)
                || ! $user->addresses()->exists();

            if ($makeDefault) {
                $user->addresses()->update(['is_default' => false]);
            }

            $user->addresses()->create([
                ...$data,
                'label' => $data['label'] ?? 'Home',
                'is_default' => $makeDefault,
            ]);
        });

        return back()->with('success', 'Address added.');
    }

    public function update(UpdateAddressRequest $request, Address $address): RedirectResponse
    {
        Gate::authorize('update', $address);

        $data = $request->validated();

        DB::transaction(function () use ($request, $address, $data) {
            unset($data['is_default']);

            $address->fill([
                ...$data,
                'label' => $data['label'] ?? $address->label,
            ]);

            if ($request->boolean('is_default')) {
                Address::query()
                    ->where('user_id', $address->user_id)
                    ->whereKeyNot($address->id)
                    ->update(['is_default' => false]);

                $address->is_default = true;
            }

            $address->save();
        });

        return back()->with('success', 'Address updated.');
    }

    public function destroy(Address $address): RedirectResponse
    {
        Gate::authorize('delete', $address);

        DB::transaction(function () use ($address) {
            $wasDefault = $address->is_default;
            $userId = $address->user_id;

            $address->delete();

            if ($wasDefault) {
                Address::query()
                    ->where('user_id', $userId)
                    ->orderBy('id')
                    ->first()
                    ?->update(['is_default' => true]);
            }
        });

        return back()->with('success', 'Address removed.');
    }
}
