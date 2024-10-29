<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;
    public $message;
    public $sender_id;
    public $receiver_id;
    public $sender_name;
    public $receiver_name;

    /**
     * Create a new event instance.
     */
    public function __construct($message,$sender_id,$receiver_id,$sender_name,$receiver_name)
    {   
        $this->message = $message;
        $this->sender_id = $sender_id;
        $this->receiver_id = $receiver_id;
        $this->sender_name = $sender_name;
        $this->receiver_name = $receiver_name;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel("msg-channel.{$this->receiver_id}"),
        ];
    }
    public function broadcastAs()
    {
        return 'message.sent'; // Event name for listening
    }
}
