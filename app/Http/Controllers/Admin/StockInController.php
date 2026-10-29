<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use App\Models\StockIn;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StockInController extends Controller
{
    /**
     * Display stock-in history.
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $from = $request->input('from');
        $to = $request->input('to');

        $stockIns = StockIn::query()
            ->with([
                'ingredient:id,ingredient_name,unit',
                'supplier:id,name',
            ])
            ->when($search !== '', function ($query) use ($search) {
                $query->whereHas(
                    'ingredient',
                    fn ($query) => $query->where(
                        'ingredient_name',
                        'like',
                        "%{$search}%",
                    ),
                );
            })
            ->when($from, fn ($query) => $query->whereDate('received_at', '>=', $from))
            ->when($to, fn ($query) => $query->whereDate('received_at', '<=', $to))
            ->latest('received_at')
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/StockIns/Index', [
            'stockIns' => $stockIns,
            'filters' => [
                'search' => $search,
                'from' => $from ?? '',
                'to' => $to ?? '',
            ],
        ]);
    }

    /**
     * Show the stock-in form.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/StockIns/Create', [
            'ingredients' => Ingredient::orderBy('ingredient_name')
                ->get(['id', 'ingredient_name', 'unit', 'quantity']),
            'suppliers' => Supplier::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    /**
     * Store a stock-in and increase the ingredient balance atomically.
     */
    public function store(Request $request)
    {
        $validated = $this->validateStockIn($request);

        DB::transaction(function () use ($validated) {
            $ingredient = Ingredient::lockForUpdate()
                ->findOrFail($validated['ingredient_id']);

            StockIn::create([
                ...$validated,
                'total_cost' => round(
                    $validated['quantity'] * $validated['unit_cost'],
                    2,
                ),
            ]);

            $ingredient->quantity = round(
                (float) $ingredient->quantity + (float) $validated['quantity'],
                2,
            );

            $ingredient->syncStatus();
        });

        return redirect()
            ->route('admin.stock-ins.index')
            ->with('success', 'Stock-in recorded and ingredient quantity updated.');
    }

    /**
     * Show the edit form.
     */
    public function edit(StockIn $stockIn): Response
    {
        $suppliers = Supplier::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        // Keep the historical supplier selectable even if it was deactivated.
        if (
            $stockIn->supplier_id &&
            ! $suppliers->contains('id', $stockIn->supplier_id)
        ) {
            $historical = Supplier::find($stockIn->supplier_id, ['id', 'name']);

            if ($historical) {
                $suppliers->push($historical);
            }
        }

        return Inertia::render('Admin/StockIns/Edit', [
            'stockIn' => $stockIn->load('ingredient:id,ingredient_name,unit'),
            'suppliers' => $suppliers,
        ]);
    }

    /**
     * Update a stock-in and reconcile the ingredient balance atomically.
     */
    public function update(Request $request, StockIn $stockIn)
    {
        $validated = $this->validateStockIn($request);

        // The ingredient of a historical movement must not change.
        $validated['ingredient_id'] = $stockIn->ingredient_id;

        DB::transaction(function () use ($stockIn, $validated) {
            $ingredient = Ingredient::lockForUpdate()
                ->findOrFail($stockIn->ingredient_id);

            $delta = round(
                (float) $validated['quantity'] - (float) $stockIn->quantity,
                2,
            );

            $newBalance = round((float) $ingredient->quantity + $delta, 2);

            if ($newBalance < 0) {
                throw ValidationException::withMessages([
                    'quantity' => 'This change would make the ingredient quantity negative.',
                ]);
            }

            $stockIn->update([
                ...$validated,
                'total_cost' => round(
                    $validated['quantity'] * $validated['unit_cost'],
                    2,
                ),
            ]);

            $ingredient->quantity = $newBalance;

            $ingredient->syncStatus();
        });

        return redirect()
            ->route('admin.stock-ins.index')
            ->with('success', 'Stock-in updated and ingredient quantity reconciled.');
    }

    /**
     * Validate a stock-in request.
     *
     * @return array<string, mixed>
     */
    private function validateStockIn(Request $request): array
    {
        return $request->validate([
            'ingredient_id' => ['required', 'exists:ingredients,id'],
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'quantity' => ['required', 'numeric', 'min:0.01'],
            'unit_cost' => ['required', 'numeric', 'min:0'],
            'received_at' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ]);
    }
}
