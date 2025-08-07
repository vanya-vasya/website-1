"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const routes = [
  {
    name: "Home",
    href: "/#home",
  },
  {
    name: "Features",
    href: "/#features",
  },
  {
    name: "FAQ",
    href: "/#faq",
  },
  {
    name: "Solutions",
    href: "/#solutions",
  },
  {
    name: "Testimonials",
    href: "/#testimonials",
  },
];

export const GuestMobileSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger>
        <Menu className="lg:hidden text-white" />
      </SheetTrigger>
      <SheetContent side="right" className="p-0 bg-black">
        <div className="px-4 py-6">
          <Link href="/">
            <div className="relative h-8 w-20 mr-4">
              <Image fill alt="Logo" src="/logo.png" />
            </div>
          </Link>
          <div className="flex flex-col space-y-2 mt-6">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition text-zinc-400"
              >
                <div className="flex items-center flex-1">
                  <span className="text-sm">{route.name}</span>
                </div>
              </Link>
            ))}
            <Link
              href="/dashboard"
              className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition text-zinc-400"
            >
              <div className="flex items-center flex-1">
                <span className="text-sm">Dashboard</span>
              </div>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
