import RouteStateCard from "@/components/RouteStateCard";


export default function Loading() {

  return (
    <main
      className="systemStatePage"
      aria-busy="true"
    >

      <RouteStateCard
        loading
        announce="status"
        eyebrow="COACH LOADING"
        title="Getting your route ready."
        description="Basse is preparing the next view. This should only take a moment."
      />

    </main>
  );
}
