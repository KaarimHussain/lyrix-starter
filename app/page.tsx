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
            <Link href={"https://lyrix-seven.vercel.app/"}>
              <Button size="lg">
                Check Out the Website
              </Button>
            </Link>
            <Link href={"https://lyrix-seven.vercel.app/docs"}>
              <Button variant="secondary" size="lg">
                Read Docs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
