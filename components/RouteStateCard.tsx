import type {
  ReactNode,
} from "react";


type RouteStateCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  signal?: string;
  loading?: boolean;
  announce?:
    | "alert"
    | "status";
  children?: ReactNode;
};


export default function RouteStateCard({
  eyebrow,
  title,
  description,
  signal,
  loading = false,
  announce,
  children,
}: RouteStateCardProps) {

  return (
    <section
      className="systemStateCard"
      role={announce}
      aria-live={
        announce === "alert"
          ? "assertive"
          : announce === "status"
            ? "polite"
            : undefined
      }
      aria-labelledby="system-state-title"
    >

      <span className="systemStateBrand">
        BASSE
      </span>


      {loading ? (
        <div
          className="systemStateLoader"
          aria-hidden="true"
        >
          <span />
          <span />
          <span />
        </div>
      ) : (
        <div
          className="systemStateSignal"
          aria-hidden="true"
        >
          <span>
            {signal}
          </span>
        </div>
      )}


      <span className="systemStateEyebrow">
        {eyebrow}
      </span>

      <h1 id="system-state-title">
        {title}
      </h1>

      <p className="systemStateCopy">
        {description}
      </p>


      {children && (
        <div className="systemStateActions">
          {children}
        </div>
      )}

    </section>
  );
}
