<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Messages;

class MessagesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
         // Example data to be inserted
         $messages = [
            [
                'sender_id' => 1, // Adjust this based on your actual user IDs
                'content' => 'Hello, this is a group message.',
                'room_id' => 1,
                'receiver_id' => null, // Since this is a group message, receiver can be null
                'is_group' => true,
            ],
            [
                'sender_id' => 2,
                'content' => 'Welcome to the group!',
                'room_id' => 1,
                'receiver_id' => null,
                'is_group' => true,
            ],
            [
                'sender_id' => 1,
                'content' => 'Let’s discuss our project.',
                'room_id' => 1,
                'receiver_id' => null,
                'is_group' => true,
            ],
        ];

        // Insert each message into the messages table
        foreach ($messages as $message) {
            Messages::create($message);
        }
    }
}
