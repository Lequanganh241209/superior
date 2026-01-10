export default function SettingsPage() {
    return (
        <div className="p-8 space-y-6 h-full overflow-y-auto">
            <h1 className="text-3xl font-bold">Settings</h1>
            <div className="p-6 border rounded-lg bg-card/50">
                <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
                <p className="text-muted-foreground">Account management features are coming soon.</p>
            </div>
            
             <div className="p-6 border rounded-lg bg-card/50">
                <h2 className="text-xl font-semibold mb-4">Appearance</h2>
                <p className="text-muted-foreground">Theme customization is managed automatically by the system.</p>
            </div>
        </div>
    );
}
