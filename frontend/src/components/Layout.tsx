import { Link, Outlet, useLocation } from "react-router-dom";
import { FileText, Package, Truck, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { name: "Quotations", href: "/quotations", icon: FileText },
    { name: "Products", href: "/products", icon: Package },
    { name: "Delivery", href: "/delivery", icon: Truck },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="flex flex-row items-center gap-5 text-sm font-medium md:gap-6">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <span className="sr-only">ERP System</span>
          </Link>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 transition-colors hover:text-foreground",
                  isActive ? "text-foreground font-bold" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default Navbar;
