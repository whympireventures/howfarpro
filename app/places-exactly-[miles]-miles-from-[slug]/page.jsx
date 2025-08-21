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
    typeof searchParams.tolerance === "string" ? searchParams.tolerance : undefined;

  return (
    <Suspense fallback={<div className="map-loading">Loading…</div>}>
      <ClientPage miles={params.miles} slug={params.slug} toleranceParam={tolerance} />
    </Suspense>
  );
}

            <summary>How is distance calculated?</summary>
            <p>
              We calculate great-circle distances with the Haversine formula, then convert kilometers to miles.
            </p>
          </details>
          <details>
            <summary>Can I change the origin or distance?</summary>
            <p>
              Yes—modify the URL. Example: <code>/places-exactly-50-miles-from-anaheim-ca/</code> or change the
              tolerance with <code>?tolerance=10</code>.
            </p>
          </details>
        </section>
      </main>

      <Footer />
    </>
  );
}
