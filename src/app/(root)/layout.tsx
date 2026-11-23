import Footer from "@/Componenets/(root)/shared/Footer";
import Navbar from "@/Componenets/(root)/shared/Navbar";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      <main className="min-w-0 flex-1">{children}</main>
      <Footer />
    </>
  );
};

export default RootLayout;
