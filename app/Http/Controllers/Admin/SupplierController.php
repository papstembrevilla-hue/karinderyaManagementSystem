<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    /**
     * Display all suppliers.
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));

        $suppliers = Supplier::query()
            ->withCount('stockIns')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('contact_person', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Suppliers/Index', [
            'suppliers' => $suppliers,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Show create form.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Suppliers/Create');
    }

    /**
     * Store a new supplier.
     */
    public function store(Request $request)
    {
        $validated = $this->validateSupplier($request);

        $validated['is_active'] = $request->boolean('is_active', true);

        Supplier::create($validated);

        return redirect()
            ->route('admin.suppliers.index')
            ->with('success', 'Supplier created successfully.');
    }

    /**
     * Display a single supplier with its stock-in history.
     */
    public function show(Supplier $supplier): Response
    {
        $supplier->load([
            'stockIns' => fn ($query) => $query
                ->with('ingredient:id,ingredient_name,unit')
                ->latest('received_at')
                ->take(20),
        ]);

        return Inertia::render('Admin/Suppliers/Show', [
            'supplier' => $supplier,
        ]);
    }

    /**
     * Show edit form.
     */
    public function edit(Supplier $supplier): Response
    {
        return Inertia::render('Admin/Suppliers/Edit', [
            'supplier' => $supplier,
        ]);
    }

    /**
     * Update a supplier.
     */
    public function update(Request $request, Supplier $supplier)
    {
        $validated = $this->validateSupplier($request);

        $validated['is_active'] = $request->boolean(
            'is_active',
            $supplier->is_active,
        );

        $supplier->update($validated);

        return redirect()
            ->route('admin.suppliers.index')
            ->with('success', 'Supplier updated successfully.');
    }

    /**
     * Delete an unused supplier, or deactivate one with stock-in history.
     */
    public function destroy(Supplier $supplier)
    {
        if ($supplier->stockIns()->exists()) {
            $supplier->update(['is_active' => false]);

            return redirect()
                ->route('admin.suppliers.index')
                ->with(
                    'success',
                    'Supplier has stock-in history and was deactivated instead of deleted.',
                );
        }

        $supplier->delete();

        return redirect()
            ->route('admin.suppliers.index')
            ->with('success', 'Supplier deleted successfully.');
    }

    /**
     * Validate supplier data.
     *
     * @return array<string, mixed>
     */
    private function validateSupplier(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
    }
}
