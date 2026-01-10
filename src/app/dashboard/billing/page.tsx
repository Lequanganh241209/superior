import { SmartBilling } from "@/components/billing/SmartBilling";

export default function BillingPage() {
    return (
        <div className="p-8 space-y-6 h-full overflow-y-auto">
            <h1 className="text-3xl font-bold">Billing & Subscription</h1>
            <p className="text-muted-foreground">Manage your subscription and billing details.</p>
            <SmartBilling />
        </div>
    );
}
