import { Sidebar } from "@/components/Sidebar";

export default function HomePage() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex flex-1 items-center justify-center p-8 text-gray-400">
        <p>Select a document from the sidebar, or create a new one.</p>
      </main>
    </div>
  );
}
