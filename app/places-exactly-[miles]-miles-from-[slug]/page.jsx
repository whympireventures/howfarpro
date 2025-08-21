import { Suspense } from "react";
import ClientPage from "./ClientPage";

export const dynamic = "force-dynamic"; // or: export const revalidate = 0

export default function Page({ params, searchParams }) {
  const miles = params?.miles;
  const slug = params?.slug;
  const tolerance =
    typeof searchParams?.tolerance === "string" ? searchParams.tolerance : undefined;

  return (
    <Suspense fallback={<div className="map-loading">Loading…</div>}>
      <ClientPage miles={miles} slug={slug} toleranceParam={tolerance} />
    </Suspense>
  );
}

