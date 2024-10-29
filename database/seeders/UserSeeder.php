<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('users')->insert([
            [
                'email' => 'Doraemon@example.com',
                'name' => 'User One',
                'password' => Hash::make('12345678'), // Use Hash::make for hashing passwords
            ],
            [
                'email' => 'nobita@example.com',
                'name' => 'User Two',
                'password' => Hash::make('12345678'),
            ],
        ]);
    }
}
