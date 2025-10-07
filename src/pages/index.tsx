import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Next.js + tRPC + TypeScript</h1>
      <Button aria-label="Submit">Click Me</Button>
      <Link href="/auth/register">Register</Link>
      <Link href="/auth/login">Login</Link>
      <p className="mt-4">Ready to build!</p>
    </div>
  );
}
