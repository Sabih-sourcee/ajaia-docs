import { Sidebar } from "@/components/Sidebar";
import { DocumentEditor } from "@/components/DocumentEditor";

export default function DocPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex">
      <Sidebar />
      <DocumentEditor docId={params.id} />
    </div>
  );
}
