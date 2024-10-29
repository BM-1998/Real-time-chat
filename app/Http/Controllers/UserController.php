<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Rooms;
use App\Models\Messages;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Events\MessageSent;

class UserController extends Controller
{
    public function index(Request $request)
    {   
        $userId = $request->input('user_id');

        // Fetch all users except the logged-in user
        $users = User::select('id', 'name', 'profile_image')
            ->where('id', '!=', $userId)
            ->get();
        
        return response()->json($users);
    }

    public function getMessages(Request $request)
    {
        $current_uid = $request->input('user_id');
        $userId = $request->input('recipient_id');

        // Fetch all users except the logged-in user
        $users = User::select('id', 'name', 'profile_image')
            ->where('id', '!=', $current_uid)
            ->get();

        // Fetch messages between the current user and the specified user
        $messages = Messages::with(['sender:id,name', 'receiver:id,name']) // Eager load sender and receiver
            ->where(function ($query) use ($current_uid, $userId) {
                $query->where('sender_id', $current_uid)
                      ->where('receiver_id', $userId)
                      ->where('is_group', false);
            })
            ->orWhere(function ($query) use ($current_uid, $userId) {
                $query->where('sender_id', $userId)
                      ->where('receiver_id', $current_uid);
            })
            ->orderBy('created_at', 'asc')
            ->get();

        // Prepare messages with sender and receiver names
        $formattedMessages = $messages->map(function ($message) {
            return [
                'id' => $message->id,
                'content' => $message->content,
                'created_at' => $message->created_at,
                'sender_name' => $message->sender->name, // Sender's name
                'receiver_name' => $message->receiver->name, // Receiver's name
            ];
        });

        return response()->json([
            'users' => $users,
            'messages' => $formattedMessages,
        ]);
    }

    public function SendMessage(Request $request)
    {
    
        $message = Messages::create([
        'sender_id' => $request->user_id,
        'receiver_id' => $request->recipient_id, 
        'content' => $request->message, 
        'room_id' => null, 
        'is_group' => false, 
        ]);

       
        $sender = User::find($message->sender_id);
       
        $receiver = User::find($message->receiver_id);

        event(new MessageSent($request->message,$request->user_id,$request->recipient_id,$sender->name,$receiver->name));
        return response()->json([
        'id' => $message->id,
        'content' => $message->content,
        'created_at' => $message->created_at,
        'sender_name' => $sender ? $sender->name : 'Unknown', // Return the sender's name
        'receiver_name' => $receiver ? $receiver->name : 'Unknown', // Return the receiver's name
        ]);
    }

    public function getRooms(Request $request)
    {
        $userId = $request->input('user_id');

        // Fetch all rooms created by the specified user along with the creator's name and participants
        $rooms = Rooms::with(['creator:id,name', 'users:id,name']) // Eager load creator's name and users
            ->where('created_by', $userId) // Rooms created by the user
            ->orWhereHas('users', function ($query) use ($userId) {
                $query->where('user_id', $userId); // Rooms where the user is a participant
            })
            ->select('id', 'name', 'description', 'created_by') // Specify the columns you want to retrieve from rooms
            ->get();

        // Format the response to include the creator's name and participant names
        $formattedRooms = $rooms->map(function ($room) {
            return [
                'id' => $room->id,
                'name' => $room->name,
                'description' => $room->description,
                'created_by' => $room->created_by,
                'creator_name' => $room->creator ? $room->creator->name : null,
                'participants' => $room->users->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                    ];
                }),
            ];
        });

        return response()->json($formattedRooms);
    }


    public function getGroupMessages(Request $request)
    {
        $current_uid = $request->input('user_id');
        $roomId = $request->input('room_id'); // Get room_id from request

        // Fetch all users in the group (assuming is_group = true)
        $users = User::select('id', 'name', 'profile_image')
            ->orWhere('id', $current_uid) // Include the current user
            ->get();

        // Fetch messages based on room_id
        $messages = Messages::with(['sender:id,name']) // Eager load only sender
            ->where('room_id', $roomId) // Filter messages by room_id
            ->where('is_group', true)
            ->orderBy('created_at', 'asc')
            ->get();

        // Prepare messages with sender name
        $formattedMessages = $messages->map(function ($message) {
            return [
                'id' => $message->id,
                'content' => $message->content,
                'created_at' => $message->created_at,
                'sender_name' => $message->sender->name, // Sender's name
            ];
        });

        return response()->json([
            'users' => $users,
            'messages' => $formattedMessages,
        ]);
    }

    public function SendMessageGroup(Request $request)
    {
    
        $message = Messages::create([
        'sender_id' => $request->user_id,
        //'receiver_id' => $request->recipient_id, 
        'content' => $request->message, 
        'room_id' => $request->room_id, 
        'is_group' => true, 
        ]);

       
        $sender = User::find($message->sender_id);
       
        $receiver = User::find($message->receiver_id);

       
        return response()->json([
        'id' => $message->id,
        'content' => $message->content,
        'created_at' => $message->created_at,
        'sender_name' => $sender ? $sender->name : 'Unknown', // Return the sender's name
        'receiver_name' => $receiver ? $receiver->name : 'Unknown', // Return the receiver's name
        ]);
    }

    public function getAllUsers(Request $request){
        $userId = $request->input('user_id');

        // Fetch all users except the logged-in user
        $users = User::select('id', 'name', 'profile_image')
            ->where('id', '!=', $userId)
            ->get();
        
        return response()->json($users);
    }

    public function createGroup(Request $request)
    {
        // Validate the incoming request
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id', // Ensure each user ID exists in the users table
            'creator_id' => 'required|exists:users,id',
        ]);

        try {
            DB::beginTransaction();

            // Step 1: Create the room
            $room = Rooms::create([
                'name' => $request->input('name'),
                'description' => $request->input('description'),
                'created_by' => $request->input('creator_id'),
            ]);

            // Step 2: Attach users to the room
            $room->users()->attach($request->input('user_ids'));

            DB::commit();

            // Return success response
            return response()->json([
                'success' => true,
                'message' => 'Group created successfully',
                'room' => $room
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            // Return error response if any exception occurs
            return response()->json([
                'success' => false,
                'message' => 'Failed to create group',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
