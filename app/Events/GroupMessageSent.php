<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GroupMessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;
    public $message;
    public $sender_id;
    //public $receiver_id;
    public $sender_name;
    //public $receiver_name;
    public $room_id;
    /**
     * Create a new event instance.
     */
    public function __construct($message,$sender_id,$sender_name,$room_id)
    {
        $this->message = $message;
        $this->sender_id = $sender_id;
        $this->sender_name = $sender_name;
        $this->room_id = $room_id;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('grp-msg-channel'),
        ];
    }

    public function broadcastAs()
    {
        return 'group.message.sent'; // Event name for listening
    }
}
