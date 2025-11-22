import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

type MainLayoutProps = {
  children: ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
      <Footer />
      
      {/* WhatsApp floating button - visible on all customer pages */}
      <WhatsAppButton />
    </div>
  );
}
