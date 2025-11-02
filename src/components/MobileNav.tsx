"use client";

import { SignOutButton } from "@clerk/nextjs";
import { ArrowRight, LogIn, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const MobileNav = ({ isAuth }: { isAuth: boolean }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) toggleOpen();
  }, [pathname]);

  const closeOnCurrent = (href: string) => {
    if (pathname === href) {
      toggleOpen();
    }
  };

  return (
    <div className="sm:hidden">
      <Menu onClick={toggleOpen} className="relative z-50 h-5 w-5 text-zinc-700"></Menu>

      {isOpen ? (
        <div className="fixed animate-in slide-in-from-top-5 fade-in-20 inset-0 z-0 w-full">
          <ul className="absolute bg-white border-b border-zinc-200 shadow-xl grid w-full gap-3 px-10 pt-20 pb-8">
            {!isAuth ? (
              <>
                <li>
                  <Link
                    href="/sign-up"
                    className="flex items-center w-full font-semibold text-blue-500"
                    onClick={() => closeOnCurrent("/sign-up")}
                  >
                    Get started <ArrowRight className="ml-2 h-5 w-5"></ArrowRight>
                  </Link>
                </li>
                <li className="my-3 h-px w-full bg-gray-300"></li>
                <li>
                  <Link
                    href="/sign-in"
                    className="flex items-center w-full font-semibold"
                    onClick={() => closeOnCurrent("/sign-in")}
                  >
                    Sign In
                    <LogIn className="ml-2 h-5 w-5"></LogIn>
                  </Link>
                </li>
                <li className="my-3 h-px w-full bg-gray-300"></li>
                <li>
                  <Link
                    href="/pricing"
                    className="flex items-center w-full font-semibold"
                    onClick={() => closeOnCurrent("/pricing")}
                  >
                    Pricing
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/dashboard"
                    className="flex items-center w-full font-semibold"
                    onClick={() => closeOnCurrent("/dashboard")}
                  >
                    Dashboard <ArrowRight className="ml-2 h-5 w-5"></ArrowRight>
                  </Link>
                </li>
                <li className="my-3 h-px w-full bg-gray-300"></li>
                <li className="cursor-pointer">
                  <SignOutButton>
                    <div className="flex items-center w-full font-semibold">
                      Log out
                      <LogOut className="ml-2 h-5 w-5 text-red-500"></LogOut>
                    </div>
                  </SignOutButton>
                </li>
              </>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default MobileNav;
