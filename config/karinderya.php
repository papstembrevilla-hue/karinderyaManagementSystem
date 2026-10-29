<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Customer Portal Settings
    |--------------------------------------------------------------------------
    |
    | These values are deliberately kept out of the database for now (there
    | is no settings table yet). Override them through the environment when
    | the business rules change; existing .env values are never modified.
    |
    */

    'name' => env('KARINDERYA_NAME', 'Karinderya'),

    'delivery_fee' => (float) env('KARINDERYA_DELIVERY_FEE', 0),

    'payment_methods' => ['cash', 'gcash'],

    'fulfillment_methods' => ['pickup', 'delivery'],
];
