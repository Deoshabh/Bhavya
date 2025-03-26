const loadRazorpay = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
};

export const initPayment = async (orderData) => {
    try {
        const res = await loadRazorpay();
        if (!res) {
            alert('Razorpay SDK failed to load');
            return;
        }

        const options = {
            key: process.env.REACT_APP_RAZORPAY_KEY_ID,
            amount: orderData.amount,
            currency: orderData.currency,
            name: "Bhavya Events",
            description: orderData.description,
            order_id: orderData.orderId,
            handler: async (response) => {
                try {
                    return response;
                } catch (error) {
                    console.error("Payment verification failed:", error);
                }
            },
            prefill: {
                name: orderData.customerName,
                email: orderData.email,
                contact: orderData.phone
            },
            theme: {
                color: "#3399cc"
            }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
    } catch (error) {
        console.error("Payment initiation failed:", error);
        throw error;
    }
}; 