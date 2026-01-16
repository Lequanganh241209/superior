
export const TEMPLATES = {
  landing: {
    structure: {
      "src/app/page.tsx": "export default function Page() { return <main>...</main> }",
      "src/components/navbar.tsx": "...",
      "src/components/hero.tsx": "...",
      "src/components/footer.tsx": "..."
    },
    dependencies: {
      "framer-motion": "latest",
      "lucide-react": "latest"
    }
  },
  dashboard: {
    structure: {
      "src/app/page.tsx": "export default function Dashboard() { ... }",
      "src/components/sidebar.tsx": "...",
      "src/components/chart.tsx": "...",
      "src/components/stats-card.tsx": "..."
    },
    dependencies: {
      "recharts": "latest",
      "clsx": "latest"
    }
  },
  ecommerce: {
    structure: {
      "src/app/page.tsx": "export default function Shop() { ... }",
      "src/components/product-grid.tsx": "...",
      "src/components/cart.tsx": "...",
      "src/components/checkout.tsx": "..."
    },
    dependencies: {
      "stripe": "latest",
      "zustand": "latest"
    }
  }
};

export class TemplateManager {
  getTemplate(intent: 'landing' | 'dashboard' | 'ecommerce') {
    return TEMPLATES[intent] || TEMPLATES.landing;
  }
}
