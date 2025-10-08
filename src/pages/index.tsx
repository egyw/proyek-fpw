import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Next.js + tRPC + TypeScript</h1>
      <Button>
        <Link href="/auth/register">Register</Link>
      </Button>
      <Button className="ml-4">
        <Link href="/auth/login">Login</Link>
      </Button>
    </div>
  );
}
