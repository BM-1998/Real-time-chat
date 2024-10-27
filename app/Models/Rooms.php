<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rooms extends Model
{
    use HasFactory;

    // Fillable attributes
    protected $fillable = ['name', 'description', 'created_by']; // No need to include created_at, updated_at if using timestamps

    // One-to-many relationship with messages
    public function messages()
    {
        return $this->hasMany(Message::class); // Ensure 'Message' model is correctly defined
    }

    // Many-to-many relationship with users
    public function users()
    {
        return $this->belongsToMany(User::class, 'rooms_user', 'room_id', 'user_id'); // Ensure the correct pivot table name and foreign keys
    }

    // Relationship to get the creator of the room
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
