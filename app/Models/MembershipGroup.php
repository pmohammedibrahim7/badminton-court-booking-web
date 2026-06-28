<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['name', 'tier_id', 'status', 'expires_at'])]
class MembershipGroup extends Model
{
    /**
     * Get the tier that this membership group belongs to.
     */
    public function tier()
    {
        return $this->belongsTo(MembershipTier::class, 'tier_id');
    }

    /**
     * Get the members associated with this group.
     */
    public function members()
    {
        return $this->hasMany(User::class, 'membership_group_id')->where('role', 'member');
    }
}
