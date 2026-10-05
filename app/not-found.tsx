import Link from "next/link";

import RouteStateCard from "@/components/RouteStateCard";


export default function NotFound() {

  return (
    <main className="systemStatePage">

      <RouteStateCard
        signal="404"
        eyebrow="COURSE CORRECTION"
        title="This route went off course."
        description="We could not find the page you were looking for. Your training data is safe, and you can return to Basse below."
      >

        <Link
          href="/"
          className="systemStateActionPrimary"
        >
          Back to Basse
        </Link>

        <Link
          href="/login"
          className="systemStateActionSecondary"
        >
          Log in
        </Link>

      </RouteStateCard>

    </main>
  );
}
