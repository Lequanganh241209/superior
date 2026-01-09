import { Octokit } from "@octokit/rest";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const token = process.env.GITHUB_PAT;
const octokit = new Octokit({ auth: token });
const owner = "Lequanganh241209";
const repo = "taylorswift";

  const PAGE_CONTENT = `
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, Calendar, Star, Play, Heart, Share2 } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-rose-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent z-10" />
          {/* Abstract gradient background representing Eras */}
          <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-500 via-purple-900 to-zinc-950 opacity-40 animate-pulse" />
        </div>
        
        <div className="relative z-20 text-center space-y-8 px-4 max-w-5xl mx-auto">
          <h1 className="text-7xl md:text-9xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-rose-200 via-purple-200 to-blue-200 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            THE ERAS TOUR
          </h1>
          <p className="text-xl md:text-2xl text-zinc-300 max-w-2xl mx-auto font-light tracking-wide">
            A journey through the musical eras of her career (past & present!)
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button size="lg" className="bg-rose-600 hover:bg-rose-700 text-white rounded-full px-8 text-lg h-12">
              <Play className="mr-2 h-5 w-5" /> Get Tickets
            </Button>
            <Button size="lg" variant="outline" className="border-zinc-700 text-white hover:bg-zinc-900 rounded-full px-8 text-lg h-12">
              <Star className="mr-2 h-5 w-5" /> View Merchandise
            </Button>
          </div>
        </div>
      </section>

      {/* Eras Grid */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold mb-12 text-center tracking-tight">Experience The Eras</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
             { title: "Lover", color: "bg-pink-300", desc: "Cruel Summer" },
             { title: "Fearless", color: "bg-yellow-500", desc: "Love Story" },
             { title: "Evermore", color: "bg-amber-700", desc: "willow" },
             { title: "Reputation", color: "bg-zinc-800", desc: "...Ready for it?" },
             { title: "Speak Now", color: "bg-purple-600", desc: "Enchanted" },
             { title: "Red", color: "bg-red-600", desc: "All Too Well (10 Minute Version)" },
             { title: "Folklore", color: "bg-gray-400", desc: "cardigan" },
             { title: "1989", color: "bg-blue-400", desc: "Welcome to New York" },
             { title: "Midnights", color: "bg-indigo-900", desc: "Anti-Hero" }
           ].map((era, i) => (
             <Card key={i} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all hover:scale-105 duration-300 overflow-hidden group">
               <div className={\`h-2 w-full \${era.color}\`} />
               <CardHeader>
                <CardTitle className="text-2xl tracking-tighter text-zinc-100">{era.title}</CardTitle>
                <CardDescription className="text-zinc-400">Taylor's Version</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-40 bg-zinc-950/50 rounded-md flex items-center justify-center group-hover:bg-zinc-950/30 transition-colors">
                  <Music className="h-12 w-12 text-zinc-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <p className="mt-4 text-sm text-zinc-400 italic">"{era.desc}"</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-white hover:bg-zinc-800">
                  <Heart className="mr-2 h-4 w-4" /> Save
                </Button>
                <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-white hover:bg-zinc-800">
                  <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Tour Dates */}
      <section className="py-24 bg-zinc-900/50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold tracking-tight">Upcoming Dates</h2>
            <Button variant="link" className="text-rose-400">View all dates &rarr;</Button>
          </div>
          <div className="space-y-4">
            {[
              { city: "Tokyo, Japan", date: "Feb 07 - 10, 2024", venue: "Tokyo Dome" },
              { city: "Melbourne, Australia", date: "Feb 16 - 18, 2024", venue: "MCG" },
              { city: "Sydney, Australia", date: "Feb 23 - 26, 2024", venue: "Accor Stadium" },
              { city: "Singapore", date: "Mar 02 - 09, 2024", venue: "National Stadium" },
            ].map((tour, i) => (
              <div key={i} className="flex flex-col md:flex-row items-center justify-between bg-zinc-950 p-6 rounded-xl border border-zinc-800 hover:border-rose-500/50 transition-colors">
                <div className="flex items-center gap-6 mb-4 md:mb-0 w-full md:w-auto">
                  <div className="h-12 w-12 rounded-full bg-zinc-900 flex items-center justify-center text-rose-500 font-bold text-lg border border-zinc-800">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{tour.city}</h3>
                    <p className="text-zinc-400 flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> {tour.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                  <span className="text-zinc-500 text-sm hidden md:block">{tour.venue}</span>
                  <Button className="bg-white text-zinc-950 hover:bg-zinc-200 rounded-full font-semibold">
                    Tickets
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Don't miss a beat</h2>
        <p className="text-zinc-400 mb-8">Sign up for updates on the Eras Tour and new music.</p>
        <div className="flex max-w-md mx-auto gap-2">
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <Button className="bg-rose-600 hover:bg-rose-700 text-white">Subscribe</Button>
        </div>
      </section>

      <footer className="border-t border-zinc-900 py-12 text-center text-zinc-600 text-sm">
        <p>© 2024 Taylor Swift Productions. All rights reserved.</p>
      </footer>
    </div>
  )
}
`;

const GLOBALS_CSS = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 346.8 77.2% 49.8%;
    --primary-foreground: 355.7 100% 97.3%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 346.8 77.2% 49.8%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 20 14.3% 4.1%;
    --foreground: 0 0% 95%;
    --card: 24 9.8% 10%;
    --card-foreground: 0 0% 95%;
    --popover: 0 0% 9%;
    --popover-foreground: 0 0% 95%;
    --primary: 346.8 77.2% 49.8%;
    --primary-foreground: 355.7 100% 97.3%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 15%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 12 6.5% 15.1%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 85.7% 97.3%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 346.8 77.2% 49.8%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
`;

const LAYOUT_CONTENT = `import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Taylor Swift - The Eras Tour",
  description: "Experience the magic of The Eras Tour",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)}>
        {children}
      </body>
    </html>
  );
}
`;

const TAILWIND_CONFIG = `import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
`;

async function main() {
  console.log("🚀 Injecting High-Quality Content...");
  
  // Create Blobs
  const files = [
    { path: "src/app/page.tsx", content: PAGE_CONTENT },
    { path: "src/app/globals.css", content: GLOBALS_CSS },
    { path: "src/app/layout.tsx", content: LAYOUT_CONTENT },
    { path: "tailwind.config.ts", content: TAILWIND_CONFIG }
  ];

  try {
    // Get latest commit
    const { data: refData } = await octokit.rest.git.getRef({ owner, repo, ref: "heads/main" });
    const latestCommitSha = refData.object.sha;
    
    // Get Base Tree
    const { data: commitData } = await octokit.rest.git.getCommit({ owner, repo, commit_sha: latestCommitSha });
    const baseTreeSha = commitData.tree.sha;

    // Create Blobs & Tree Items
    const treeItems = [];
    for (const file of files) {
      const { data: blob } = await octokit.rest.git.createBlob({
        owner,
        repo,
        content: Buffer.from(file.content).toString("base64"),
        encoding: "base64",
      });
      treeItems.push({
        path: file.path,
        mode: "100644" as const,
        type: "blob" as const,
        sha: blob.sha,
      });
    }

    // Create New Tree
    const { data: newTree } = await octokit.rest.git.createTree({
      owner,
      repo,
      base_tree: baseTreeSha,
      tree: treeItems,
    });

    // Create Commit
    const { data: newCommit } = await octokit.rest.git.createCommit({
      owner,
      repo,
      message: "feat: ✨ Inject high-quality Taylor Swift Eras Tour landing page",
      tree: newTree.sha,
      parents: [latestCommitSha],
    });

    // Update Ref
    await octokit.rest.git.updateRef({
      owner,
      repo,
      ref: "heads/main",
      sha: newCommit.sha,
    });

    console.log("✅ Content injected successfully!");
    console.log(`Commit: ${newCommit.sha}`);

  } catch (e: any) {
    console.error("Error:", e.message);
  }
}

main();