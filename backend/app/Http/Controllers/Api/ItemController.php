<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Item;

class ItemController extends Controller
{
    public function index(Request $request)
    {
        $query = Item::with('user')->latest();

        // 🔍 GLOBAL SEARCH
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%$search%")
                  ->orWhere('description', 'like', "%$search%")
                  ->orWhere('location', 'like', "%$search%")
                  ->orWhereHas('user', function ($q2) use ($search) {
                      $q2->where('name', 'like', "%$search%");
                  });
            });
        }

        // 🎯 FILTER (lost / found)
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // 📍 NEARBY FILTER (optional — if lat/lng passed)
        if ($request->filled('latitude') && $request->filled('longitude')) {
            $lat = (float) $request->latitude;
            $lng = (float) $request->longitude;
            $radius = (float) $request->get('radius', 10); // km, default 10

            $query->whereNotNull('latitude')
                  ->whereNotNull('longitude')
                  ->selectRaw("*, (
                      6371 * acos(
                          cos(radians(?)) * cos(radians(latitude)) *
                          cos(radians(longitude) - radians(?)) +
                          sin(radians(?)) * sin(radians(latitude))
                      )
                  ) AS distance", [$lat, $lng, $lat])
                  ->having('distance', '<=', $radius)
                  ->orderBy('distance');
        }
            if ($request->filled('status')) {
        $query->where('status', $request->status);
                }

        // 📄 PAGINATION
        $items = $query->paginate(5);

        // 🖼 FIX IMAGE URL
        $items->getCollection()->transform(function ($item) {
            if ($item->image) {
                $item->image = asset('storage/' . $item->image);
            }
            return $item;
        });

        return response()->json([
            'status' => true,
            'items' => $items,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'category'    => 'nullable|string|max:255',
            'location'    => 'required|string|max:255',
            'date_lost_found'    => 'required|string|max:255',
            'latitude'    => 'nullable|numeric|between:-90,90',
            'longitude'   => 'nullable|numeric|between:-180,180',
            'type'        => 'required|in:lost,found',
            'image'       => 'nullable|image|max:2048',
        ]);

        // Handle image
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('items', 'public');
            $data['image'] = $path;
        }

        // Attach logged-in user
        $data['user_id'] = $request->user()->id;

        $item = Item::create($data);

        return response()->json([
            'status'  => true,
            'message' => 'Item created successfully',
            'item'    => $item,
        ]);
    }

    public function show($id)
    {
        $item = Item::with('user')->findOrFail($id);

        if ($item->image) {
            $item->image = asset('storage/' . $item->image);
        }

        return response()->json([
            'status' => true,
            'item'   => $item,
        ]);
    }
  

public function findMatches($id)
{
    $item = Item::findOrFail($id);
    $oppositeType = $item->type === 'lost' ? 'found' : 'lost';
    $candidates = Item::where('type', $oppositeType)->get();
    $matches = [];

    foreach ($candidates as $candidate) {
        $score = 0;

        // 1. Title similarity (20%)
        similar_text(
            strtolower($item->title),
            strtolower($candidate->title),
            $titlePercent
        );
        $score += $titlePercent * 0.20;

        // 2. Description similarity (30%)
        similar_text(
            strtolower($item->description),
            strtolower($candidate->description),
            $descPercent
        );
        $score += $descPercent * 0.30;

        // 3. Category exact match (25%)
        if (!empty($item->category) && !empty($candidate->category)) {
            if (strtolower($item->category) === strtolower($candidate->category)) {
                $score += 25;
            }
        }

        // 4. Location similarity (15%) — no longer exact match
        similar_text(
            strtolower($item->location),
            strtolower($candidate->location),
            $locationPercent
        );
        $score += $locationPercent * 0.15;

        // 5. Time proximity (10%)
        $timeDiff = abs(strtotime($item->date_lost_found) - strtotime($candidate->date_lost_found));
        if ($timeDiff <= 86400) {        // same day
            $score += 10;
        } elseif ($timeDiff <= 259200) { // within 3 days
            $score += 6;
        } elseif ($timeDiff <= 604800) { // within a week
            $score += 3;
        }

        // ✅ Lower threshold — show weak matches too
        if ($score >= 30) {
            $matches[] = [
                'item' => $candidate,
                'score' => round($score),
            ];
        }
    }

    // Sort by score descending
    usort($matches, fn($a, $b) => $b['score'] - $a['score']);

    return response()->json($matches);
}

public function markAsReturned(Request $request, $id)
{
    $item = Item::with('user')->findOrFail($id);

    // Only the item owner or admin can mark as returned
    if ($request->user()->id !== $item->user_id) {
        return response()->json([
            'status' => false,
            'message' => 'Unauthorized'
        ], 403);
    }

    if ($item->status === 'returned') {
        return response()->json([
            'status' => false,
            'message' => 'Item is already marked as returned'
        ], 400);
    }

    $data = $request->validate([
        'recovery_method' => 'required|in:system_match,direct_contact,admin_assisted',
        'recovery_notes'  => 'nullable|string|max:500',
    ]);

    $item->update([
        'status'          => 'returned',
        'recovery_method' => $data['recovery_method'],
        'recovery_notes'  => $data['recovery_notes'] ?? null,
        'recovered_at'    => now(),
        'recovered_by'    => $request->user()->id,
    ]);

    return response()->json([
        'status'  => true,
        'message' => 'Item marked as returned successfully',
        'item'    => $item,
    ]);
}

public function recoveryStats()
{
    $total    = Item::count();
    $active   = Item::where('status', 'active')->count();
    $returned = Item::where('status', 'returned')->count();

    $byMethod = Item::where('status', 'returned')
        ->selectRaw('recovery_method, count(*) as count')
        ->groupBy('recovery_method')
        ->get();

    return response()->json([
        'status' => true,
        'stats'  => [
            'total'     => $total,
            'active'    => $active,
            'returned'  => $returned,
            'by_method' => $byMethod,
        ],
    ]);
}
}