<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['name', 'price', 'tier_type', 'description'])]
class MembershipTier extends Model
{
    /**
     * Get the groups associated with this membership tier.
     */
    public function groups()
    {
        return $this->hasMany(MembershipGroup::class, 'tier_id');
    }
}
