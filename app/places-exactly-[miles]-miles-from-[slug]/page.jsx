import { Suspense } from "react";
import ClientPage from "./ClientPage";

export const dynamic = "force-dynamic"; // or: export const revalidate = 0;

export default function Page({
  params,
  searchParams,
}: {
  params: { miles: string; slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const tolerance =
    typeof searchParams?.tolerance === "string" ? searchParams.tolerance : undefined;

  return (
    <Suspense fallback={<div className="map-loading">Loading…</div>}>
      <ClientPage miles={params.miles} slug={params.slug} toleranceParam={tolerance} />
    </Suspense>
  );
}

