import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';

const PaymentForm = ({ amount, onSuccess, onError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { showNotification } = useNotification();
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);

        try {
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: elements.getElement(CardElement),
            });

            if (error) {
                showNotification(error.message, 'error');
                onError(error);
                return;
            }

            onSuccess(paymentMethod);
        } catch (err) {
            showNotification('Payment processing failed', 'error');
            onError(err);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-white p-4 rounded-lg border">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                            invalid: {
                                color: '#9e2146',
                            },
                        },
                    }}
                />
            </div>
            
            <button
                type="submit"
                disabled={!stripe || processing}
                className={`w-full bg-black text-white py-2 rounded-lg ${
                    (!stripe || processing) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
                }`}
            >
                {processing ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                    </span>
                ) : (
                    `Pay ₹${amount}`
                )}
            </button>
        </form>
    );
};

export default PaymentForm;