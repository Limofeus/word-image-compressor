// src/components/header.tsx
import { isTauriAndroid } from "@/lib/platform";
import { ThemeToggle } from "./mode-toggle";

const Header = () => {
  return (
    <header className="bg-background text-foreground border-border sticky top-0 z-50 w-full border-b">
      <div className="container mx-auto flex h-14 items-center px-4">
        <div className="flex w-full items-center justify-between">
          <div className="mr-4">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="text-primary size-8"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                <path d="M9 12h6" />
                <path d="M9 15h6" />
                <path d="M9 18h2" />
              </svg>
              <span className="text-foreground text-lg font-bold sm:inline-block">
                ВОРДКОМПРЕСОР3000
              </span>
            </a>
          </div>
          {!isTauriAndroid() && <ThemeToggle />}
        </div>
      </div>
    </header>
  );
};

export default Header;
