export interface RazorpayOptions {
    amount: number; // Amount in paisa (₹1 = 100 paisa)
    currency?: string;
    name: string;
    description: string;
    orderId?: string;
    prefill?: {
      name?: string;
      email?: string;
      contact?: string;
    };
    theme?: {
      color?: string;
    };
    notes?: Record<string, any>;
  }
  
  export interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  }
  
  export interface RazorpayError {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: Record<string, any>;
  }
  
  declare global {
    interface Window {
      Razorpay: any;
    }
  }
  
  /**
   * Load Razorpay script dynamically
   */
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
  
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  export const initializeRazorpayPayment = async (
    options: RazorpayOptions
  ): Promise<RazorpayResponse> => {
    return new Promise(async (resolve, reject) => {
      try {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          throw new Error('Failed to load Razorpay SDK');
        }
  
        const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        if (!razorpayKey) {
          throw new Error('Razorpay key not configured');
        }
  
        const razorpayOptions = {
          key: razorpayKey,
          amount: options.amount,
          currency: options.currency || 'INR',
          name: options.name,
          description: options.description,
          order_id: options.orderId,
          handler: function (response: RazorpayResponse) {
            resolve(response);
          },
          prefill: options.prefill || {},
          notes: options.notes || {},
          theme: {
            color: options.theme?.color || '#3399cc',
          },
          modal: {
            ondismiss: function () {
              reject(new Error('Payment cancelled by user'));
            },
          },
        };
  
        const rzp = new window.Razorpay(razorpayOptions);
  
        rzp.on('payment.failed', function (response: { error: RazorpayError }) {
          reject({
            message: 'Payment failed',
            error: response.error,
          });
        });
  
        rzp.open();
      } catch (error) {
        reject(error);
      }
    });
  };

  export const PaymentConfigs = {
    GUIDE_REGISTRATION: {
      amount: 10000,
      name: 'Tourism Registry',
      description: 'Guide Registration Fee',
      currency: 'INR',
    },
    TOUR_BOOKING: {
      name: 'Tourism Registry',
      description: 'Tour Booking Payment',
      currency: 'INR',
    },
    SERVICE_FEE: {
      name: 'Tourism Registry',
      description: 'Service Fee',
      currency: 'INR',
    },
  } as const;
  

  export const rupeesToPaisa = (rupees: number): number => {
    return Math.round(rupees * 100);
  };
  

  export const paisaToRupees = (paisa: number): number => {
    return paisa / 100;
  };

  export const createRazorpayOrder = async (
    amount: number,
    currency: string = 'INR',
    receipt?: string
  ): Promise<{ orderId: string; amount: number }> => {
    try {
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          receipt: receipt || `receipt_${Date.now()}`,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
  
      const data = await response.json();
      return {
        orderId: data.id,
        amount: data.amount,
      };
    } catch (error) {
      throw new Error(`Failed to create order: ${error}`);
    }
  };
  

  export const verifyRazorpayPayment = async (paymentData: {
    paymentId: string;
    orderId?: string;
    signature?: string;
    amount: number;
  }): Promise<{ verified: boolean; message?: string }> => {
    try {
      const response = await fetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
  
      if (!response.ok) {
        throw new Error('Payment verification failed');
      }
  
      return await response.json();
    } catch (error) {
      throw new Error(`Payment verification failed: ${error}`);
    }
  };