"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

function Header() {
  const [scrolled, setScrolled] = useState(false);

  const { user } = useUser();

  return (
    <header className={cn("sticky top-0 z-50 w-full transition-all duration-300")}>
      <div className="layout-padding flex h-20 items-center justify-between">
        {/* Logo */}
        <div className="flex w-[150px] items-center">
          <span className="text-2xl font-bold tracking-tight cursor-pointer transition-opacity hover:opacity-80 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            MOK
          </span>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2">
          <ul className="flex items-center gap-10 text-[15px] font-semibold text-muted-foreground">
            {["Home", "Pricing"].map((item) => (
              <li
                key={item}
                className="relative cursor-pointer transition-all duration-200 hover:text-foreground hover:-translate-y-[1px]"
              >
                {item}
                <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-primary transition-all duration-300 group-hover:w-full" />
              </li>
            ))}
          </ul>
        </nav>

        {/* Actions */}
        <div className="flex w-[200px] items-center justify-end gap-3">
          {!user ? (
            <SignInButton mode="modal">
              <Button className="rounded-full px-6 font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                Get Started
              </Button>
            </SignInButton>
          ) : (
            <UserButton />
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
