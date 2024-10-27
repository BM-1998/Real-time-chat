<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Messages;
class MessageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $messages = [
            [
                'sender_id' => 1,
                'receiver_id' => 2,
                'content' => 'Hello, how are you?',
                'room_id' => null,
                'is_group' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'sender_id' => 2,
                'receiver_id' => 1,
                'content' => 'I am fine, thank you! How about you?',
                'room_id' => null,
                'is_group' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'sender_id' => 1,
                'receiver_id' => 2,
                'content' => 'Are we still on for lunch tomorrow?',
                'room_id' => null,
                'is_group' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'sender_id' => 2,
                'receiver_id' => 1,
                'content' => 'Yes, looking forward to it!',
                'room_id' => null,
                'is_group' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Insert messages into the database
        foreach ($messages as $message) {
            Messages::create($message);
        }
    }
}
