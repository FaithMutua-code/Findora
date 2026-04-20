<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Item;

class ItemController extends Controller
{
public function index()
{
    $items = Item::with('user')
        ->latest()
        ->get()
        ->map(function ($item) {
            if ($item->image) {
                $item->image = asset('storage/' . $item->image);
            }
            return $item;
        });

    return response()->json([
        'status' => true,
        'items' => $items
    ]);
}
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'nullable|string|max:255',
            'location' => 'required|string|max:255',
            'type' => 'required|in:lost,found',
            'image' => 'nullable|image|max:2048',
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
            'status' => true,
            'message' => 'Item created successfully',
            'item' => $item,
        ]);
    }
}