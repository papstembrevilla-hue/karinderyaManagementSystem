<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use App\Models\StockOut;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StockOutController extends Controller
{
    /**
     * Display stock-out history.
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $from = $request->input('from');
        $to = $request->input('to');

        $stockOuts = StockOut::query()
            ->with('ingredient:id,ingredient_name,unit')
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
            ->when($from, fn ($query) => $query->whereDate('occurred_at', '>=', $from))
            ->when($to, fn ($query) => $query->whereDate('occurred_at', '<=', $to))
            ->latest('occurred_at')
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/StockOuts/Index', [
            'stockOuts' => $stockOuts,
            'filters' => [
                'search' => $search,
                'from' => $from ?? '',
                'to' => $to ?? '',
            ],
        ]);
    }

    /**
     * Show the stock-out form.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/StockOuts/Create', [
            'ingredients' => Ingredient::orderBy('ingredient_name')
                ->get(['id', 'ingredient_name', 'unit', 'quantity']),
            'reasons' => StockOut::REASONS,
        ]);
    }

    /**
     * Store a stock-out and decrease the ingredient balance atomically.
     */
    public function store(Request $request)
    {
        $validated = $this->validateStockOut($request);

        DB::transaction(function () use ($validated) {
            $ingredient = Ingredient::lockForUpdate()
                ->findOrFail($validated['ingredient_id']);

            $this->ensureAvailable($ingredient, $validated['quantity']);

            StockOut::create($validated);

            $ingredient->quantity = round(
                (float) $ingredient->quantity - (float) $validated['quantity'],
                2,
            );

            $ingredient->syncStatus();
        });

        return redirect()
            ->route('admin.stock-outs.index')
            ->with('success', 'Stock-out recorded and ingredient quantity updated.');
    }

    /**
     * Show the edit form.
     */
    public function edit(StockOut $stockOut): Response
    {
        return Inertia::render('Admin/StockOuts/Edit', [
            'stockOut' => $stockOut->load('ingredient:id,ingredient_name,unit'),
            'reasons' => StockOut::REASONS,
        ]);
    }

    /**
     * Update a stock-out and reconcile the ingredient balance atomically.
     */
    public function update(Request $request, StockOut $stockOut)
    {
        $validated = $this->validateStockOut($request);

        // The ingredient of a historical movement must not change.
        $validated['ingredient_id'] = $stockOut->ingredient_id;

        DB::transaction(function () use ($stockOut, $validated) {
            $ingredient = Ingredient::lockForUpdate()
                ->findOrFail($stockOut->ingredient_id);

            $delta = round(
                (float) $validated['quantity'] - (float) $stockOut->quantity,
                2,
            );

            $this->ensureAvailable($ingredient, $delta);

            $stockOut->update($validated);

            $ingredient->quantity = round(
                (float) $ingredient->quantity - $delta,
                2,
            );

            $ingredient->syncStatus();
        });

        return redirect()
            ->route('admin.stock-outs.index')
            ->with('success', 'Stock-out updated and ingredient quantity reconciled.');
    }

    /**
     * Ensure the requested decrease does not exceed available stock.
     */
    private function ensureAvailable(Ingredient $ingredient, float $decrease): void
    {
        if (round($decrease, 2) > round((float) $ingredient->quantity, 2)) {
            throw ValidationException::withMessages([
                'quantity' => "Only {$ingredient->quantity} {$ingredient->unit} is available.",
            ]);
        }
    }

    /**
     * Validate a stock-out request.
     *
     * @return array<string, mixed>
     */
    private function validateStockOut(Request $request): array
    {
        return $request->validate([
            'ingredient_id' => ['required', 'exists:ingredients,id'],
            'quantity' => ['required', 'numeric', 'min:0.01'],
            'reason' => ['required', 'string', Rule::in(StockOut::REASONS)],
            'occurred_at' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ]);
    }
}
