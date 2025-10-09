import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

type MainLayoutProps = {
  children: ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
