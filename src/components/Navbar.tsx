import MaxWidthWrapper from "./MaxWidthWrapper";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { ArrowRight } from "lucide-react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import UserAccountNav from "./UserAccountNav";
import MobileNav from "./MobileNav";

const Navbar = async () => {
  const { userId } = await auth();
  const user = await currentUser();

  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/65 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href="/" className="flex z-40 font-semibold">
            <span>X-Cheq</span>
          </Link>

          <MobileNav isAuth={!!userId}></MobileNav>

          <div className="hidden items-center space-x-4 sm:flex ">
            {!userId ? (
              <>
                <Link
                  href="/pricing"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                >
                  Pricing
                </Link>

                <SignInButton>
                  <button
                    className={buttonVariants({
                      variant: "ghost",
                      size: "sm",
                    })}
                  >
                    Sign In
                  </button>
                </SignInButton>

                <SignUpButton>
                  <button
                    className={buttonVariants({
                      size: "sm",
                    })}
                  >
                    Get Started <ArrowRight className="ml-1.5 h-5 w-5"></ArrowRight>
                  </button>
                </SignUpButton>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                >
                  Dashboard
                </Link>

                <UserAccountNav
                  name={
                    !user?.firstName || !user.lastName
                      ? "Your Account"
                      : `${user.firstName} ${user.lastName}`
                  }
                  email={user?.primaryEmailAddress?.emailAddress ?? ""}
                  imageUrl={user?.imageUrl ?? ""}
                ></UserAccountNav>
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
