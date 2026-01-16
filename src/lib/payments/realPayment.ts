
import Stripe from 'stripe';

// Initialize Stripe with Secret Key (Server-side only)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-04-10' // Use latest API version
});

export interface Subscription {
    id: string;
    clientSecret: string | null;
    status: string;
}

export class RealPaymentSystem {
  
  async createRealSubscription(userId: string, email: string, planPriceId: string): Promise<Subscription> { 
    // 1. Find or Create Stripe customer 
    const customers = await stripe.customers.list({ email: email, limit: 1 });
    let customer = customers.data[0];

    if (!customer) {
        customer = await stripe.customers.create({ 
            email: email, 
            metadata: { userId } 
        }); 
    }
     
    // 2. Create real subscription 
    const subscription = await stripe.subscriptions.create({ 
      customer: customer.id, 
      items: [{ price: planPriceId }], 
      payment_behavior: 'default_incomplete', 
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'] 
    }); 
     
    // 3. Return client secret for frontend checkout
    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

    return { 
      id: subscription.id, 
      clientSecret: paymentIntent?.client_secret || null, 
      status: subscription.status 
    }; 
  } 
   
  async handleRealWebhook(body: any, signature: string): Promise<void> { 
    // Verify webhook signature
    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
        throw new Error(`Webhook Error: ${err.message}`);
    }

    // Handle real Stripe webhooks 
    switch (event.type) { 
      case 'invoice.payment_succeeded': 
        const invoice = event.data.object as Stripe.Invoice; 
        // Update DB via internal API or direct DB call
        console.log(`Payment succeeded for customer ${invoice.customer}`);
        break; 
         
      case 'customer.subscription.deleted': 
        const subscription = event.data.object as Stripe.Subscription; 
        console.log(`Subscription deleted for customer ${subscription.customer}`);
        break; 
    } 
  } 
}
