<?php
// app/Http/Controllers/Api/V1/DeliveryController.php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    /**
     * Retorna o relatório consolidado de entregas com filtros de alta performance.
     * Uso estrito de Type Hinting e API Resources do PHP 8 moderno.
     */
    public function getConsolidatedReport(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Delivery::class); // Segurança via Policies

        $deliveries = Delivery::query()
            ->with(['driver', 'company']) // Previne problema de N+1 queries no Eloquent
            ->where('company_id', $request->user()->company_id)
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->paginate(50); // Paginação obrigatória para performance

        return response()->json([
            'success' => true,
            'data' => $deliveries
        ]);
    }
}
