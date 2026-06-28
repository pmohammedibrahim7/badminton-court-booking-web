<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MembershipCredentialsMail extends Mailable
{
    use Queueable, SerializesModels;

    public $memberName;
    public $email;
    public $password;
    public $isUpdate;

    /**
     * Create a new message instance.
     */
    public function __construct($memberName, $email, $password, $isUpdate = false)
    {
        $this->memberName = $memberName;
        $this->email = $email;
        $this->password = $password;
        $this->isUpdate = $isUpdate;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->isUpdate ? 'Smash Badminton Club - Login Credentials Updated' : 'Welcome to Smash Badminton Club - Membership Login Credentials',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.membership_credentials',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
