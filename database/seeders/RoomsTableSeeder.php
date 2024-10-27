<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class RoomsTableSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create();

        // Create an array of room data
        $rooms = [
            [
                'name' => $faker->word,
                'description' => $faker->sentence,
                'created_by' => 1, // User 1
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => $faker->word,
                'description' => $faker->sentence,
                'created_by' => 2, // User 2
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // You can add more rooms here as needed
        ];

        // Insert the data into the rooms table
        DB::table('rooms')->insert($rooms);
    }
}
