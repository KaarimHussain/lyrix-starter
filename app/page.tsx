import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="min-h-screen w-full pt-20">
        <div className="flex flex-col container-layout">
          <h1 className="text-5xl font-bold">
            Hello, Lyrix Here
          </h1>
          <div className="flex items-center gap-5 mt-5">
            <Button asChild size="lg">
              <Link href="https://lyrix-seven.vercel.app/">
                Check Out the Website
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="https://lyrix-seven.vercel.app/docs">
                Read Docs
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
