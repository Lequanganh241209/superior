 "use client";
 import { useState } from "react";
 import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { toast } from "sonner";
 
 export default function SettingsPage() {
   const [name, setName] = useState("Architect");
   const [email, setEmail] = useState("architect@aether.os");
   const [themeDark, setThemeDark] = useState(true);
   const [notifyBuilds, setNotifyBuilds] = useState(true);
   const [notifyBilling, setNotifyBilling] = useState(false);
 
   const handleSaveAccount = () => {
     toast.success("Account settings saved.");
   };
 
   const handleSaveAppearance = () => {
     toast.success(`Theme set to ${themeDark ? "Dark" : "Light"}.`);
   };
 
   const handleSaveNotifications = () => {
     toast.success("Notification preferences updated.");
   };
 
   return (
     <div className="p-8 space-y-6 h-full overflow-y-auto">
       <h1 className="text-3xl font-bold">Settings</h1>
 
       <Card>
         <CardHeader>
           <CardTitle>Account</CardTitle>
           <CardDescription>Manage your profile information</CardDescription>
         </CardHeader>
         <CardContent className="space-y-4">
           <div className="space-y-2">
             <label className="text-xs font-medium text-muted-foreground">Display Name</label>
             <input
               type="text"
               value={name}
               onChange={(e) => setName(e.target.value)}
               className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
             />
           </div>
           <div className="space-y-2">
             <label className="text-xs font-medium text-muted-foreground">Email</label>
             <input
               type="email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
             />
           </div>
         </CardContent>
         <CardFooter>
           <Button onClick={handleSaveAccount}>Save changes</Button>
         </CardFooter>
       </Card>
 
       <Card>
         <CardHeader>
           <CardTitle>Appearance</CardTitle>
           <CardDescription>Customize visual preferences</CardDescription>
         </CardHeader>
         <CardContent className="space-y-4">
           <div className="flex items-center justify-between">
             <div>
               <p className="text-sm font-medium">Dark Mode</p>
               <p className="text-xs text-muted-foreground">Prefer dark theme across the app</p>
             </div>
             <label className="inline-flex items-center cursor-pointer">
               <input
                 type="checkbox"
                 checked={themeDark}
                 onChange={(e) => setThemeDark(e.target.checked)}
                 className="peer sr-only"
               />
               <span className="w-11 h-6 bg-input rounded-full relative transition-colors peer-checked:bg-primary">
                 <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-background rounded-full transition-transform peer-checked:translate-x-5" />
               </span>
             </label>
           </div>
         </CardContent>
         <CardFooter>
           <Button onClick={handleSaveAppearance}>Apply</Button>
         </CardFooter>
       </Card>
 
       <Card>
         <CardHeader>
           <CardTitle>Notifications</CardTitle>
           <CardDescription>Control system alerts</CardDescription>
         </CardHeader>
         <CardContent className="space-y-4">
           <label className="flex items-center justify-between">
             <span className="text-sm">Build & deploy updates</span>
             <input
               type="checkbox"
               checked={notifyBuilds}
               onChange={(e) => setNotifyBuilds(e.target.checked)}
               className="w-4 h-4"
             />
           </label>
           <label className="flex items-center justify-between">
             <span className="text-sm">Billing reminders</span>
             <input
               type="checkbox"
               checked={notifyBilling}
               onChange={(e) => setNotifyBilling(e.target.checked)}
               className="w-4 h-4"
             />
           </label>
         </CardContent>
         <CardFooter>
           <Button variant="outline" onClick={handleSaveNotifications}>Save</Button>
         </CardFooter>
       </Card>
 
       <Card>
         <CardHeader>
           <CardTitle>API Keys</CardTitle>
           <CardDescription>Manage secure credentials</CardDescription>
         </CardHeader>
         <CardContent className="space-y-3">
           <div className="flex items-center justify-between">
             <div>
               <p className="text-sm font-medium">Primary Key</p>
               <p className="text-xs text-muted-foreground">Masked for security</p>
             </div>
             <code className="text-xs bg-muted px-2 py-1 rounded-md">sk_live_••••••••••••••••</code>
           </div>
         </CardContent>
         <CardFooter className="gap-2">
           <Button size="sm">Generate New</Button>
           <Button size="sm" variant="outline">Revoke</Button>
         </CardFooter>
       </Card>
 
       <Card>
         <CardHeader>
           <CardTitle>Danger Zone</CardTitle>
           <CardDescription>Irreversible actions</CardDescription>
         </CardHeader>
         <CardContent>
           <p className="text-sm text-muted-foreground">
             Deleting your account will remove all projects and data. This cannot be undone.
           </p>
         </CardContent>
         <CardFooter>
           <Button variant="destructive" disabled>Delete Account</Button>
         </CardFooter>
       </Card>
     </div>
   );
 }
