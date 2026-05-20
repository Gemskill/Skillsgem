import { Switch, Route, Router, Link, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Directory from "@/pages/directory";
import ServiceDetail from "@/pages/service-detail";
import Submit from "@/pages/submit";
import About from "@/pages/about";
import Admin from "@/pages/admin";
import { Logo } from "@/components/logo";

function Nav() {
  const [location] = useLocation();
  const item = (href: string, label: string) => {
    const active = location === href || (href !== "/" && location.startsWith(href));
    return (
      <Link
        href={href}
        data-testid={`link-nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 ${
          active ? "text-primary" : "text-foreground/80"
        }`}
      >
        {label}
      </Link>
    );
  };
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-background/85 border-b border-border">
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-3 flex items-center gap-2 md:gap-4">
        <Link href="/" className="flex items-center gap-2 mr-2 md:mr-4" data-testid="link-home-logo">
          <Logo className="h-7 w-7 text-primary" />
          <span className="font-serif text-xl font-semibold tracking-tight">Skillsgem</span>
        </Link>
        <nav className="flex items-center gap-1 ml-auto">
          {item("/directory", "Directory")}
          {item("/submit", "Submit")}
          {item("/about", "About")}
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-sidebar">
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-8 grid gap-6 md:grid-cols-3 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Logo className="h-5 w-5 text-primary" />
            <span className="font-serif text-lg font-semibold">Skillsgem</span>
          </div>
          <p className="text-muted-foreground">
            A community-built directory of SEND services across the UK, Northern Ireland and the Crown Dependencies.
          </p>
        </div>
        <div>
          <div className="font-semibold mb-2">Explore</div>
          <ul className="space-y-1 text-muted-foreground">
            <li><Link href="/directory" className="hover:text-foreground">Browse the directory</Link></li>
            <li><Link href="/submit" className="hover:text-foreground">Submit a service</Link></li>
            <li><Link href="/about" className="hover:text-foreground">About & sources</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Note</div>
          <p className="text-muted-foreground">
            Listings are a first-pass from public data. Always verify with the provider before relying on services for your child.
          </p>
        </div>
      </div>
      <div className="text-xs text-muted-foreground text-center pb-6">© {new Date().getFullYear()} Skillsgem</div>
    </footer>
  );
}

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/directory" component={Directory} />
      <Route path="/service/:id" component={ServiceDetail} />
      <Route path="/submit" component={Submit} />
      <Route path="/about" component={About} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router hook={useHashLocation}>
          <div className="min-h-screen flex flex-col">
            <Nav />
            <main className="flex-1">
              <AppRouter />
            </main>
            <Footer />
          </div>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
