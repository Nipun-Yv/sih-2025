
import VRPlayer from "@/components/VRPlayer"

export default async function VRPage({ params }) {
  const { slug } = params;

  return (
    <main>
      <VRPlayer slug={slug} />
    </main>
  );
}