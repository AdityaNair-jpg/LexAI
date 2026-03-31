import { Navbar } from "@/components/navbar";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fbf9f6]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-12">{children}</main>
    </div>
  );
}
