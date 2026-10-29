<?php

namespace App\Http\Requests\Portal;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'checkout_token' => ['required', 'string', 'max:64'],
            'fulfillment_method' => ['required', Rule::in(config('karinderya.fulfillment_methods'))],
            'payment_method' => ['required', Rule::in(config('karinderya.payment_methods'))],
            'address_id' => [
                'nullable',
                'integer',
                Rule::exists('addresses', 'id')->where('user_id', $this->user()->id),
            ],
            'recipient_name' => ['nullable', 'string', 'max:255', 'required_if:fulfillment_method,delivery'],
            'contact_phone' => ['required', 'string', 'max:30'],
            'delivery_address' => ['nullable', 'string', 'max:1000', 'required_if:fulfillment_method,delivery'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'address_id.exists' => 'Please choose one of your saved addresses.',
            'recipient_name.required_if' => 'A recipient name is required for delivery.',
            'delivery_address.required_if' => 'A delivery address is required for delivery.',
        ];
    }
}
