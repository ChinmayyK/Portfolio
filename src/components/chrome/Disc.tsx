import Magnetic from "./Magnetic";
import { TLink } from "./Transition";

type Props = { href: string; children: React.ReactNode; label?: string; tone?: "ink" | "lime"; size?: "md" | "lg"; external?: boolean };

/** The round button: an ink or lime disc that fills from below on hover and leans toward the pointer. */
export default function Disc({ href, children, label, tone = "ink", size = "md", external = false }: Props) {
  const cls = `disc disc--${tone} disc--${size}`;
  const inner = (
    <>
      <span className="disc-fill" aria-hidden="true" />
      <span className="disc-text">{children}</span>
    </>
  );
  return (
    <Magnetic strength={0.35}>
      {external || href.startsWith("mailto:") || href.startsWith("/resume")
        ? <a href={href} className={cls}>{inner}</a>
        : <TLink href={href} label={label} className={cls}>{inner}</TLink>}
    </Magnetic>
  );
}
