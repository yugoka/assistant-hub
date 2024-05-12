import { BrandIcon } from "@/components/common/BrandIcon";
import { HomeIcon } from "lucide-react";
import Link from "next/link";

export default function NavMenu() {
  return (
    <>
      <div>
        <div className="flex items-center justify-between px-4 pb-6 border-b dark:border-gray-800">
          <Link className="flex items-center" href="#">
            <BrandIcon className="h-6 w-6 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
              Assistant Hub
            </span>
          </Link>
        </div>
        <nav className="space-y-1 px-4 py-3">
          <Link
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50"
            href="#"
          >
            <HomeIcon className="mr-3 h-5 w-5" />
            Home
          </Link>
        </nav>
      </div>
    </>
  );
}
