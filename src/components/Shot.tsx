import { imgProps, hasDark } from "@/lib/content";

type Props = { file: string; alt: string; className?: string; loading?: "lazy" | "eager" };

/**
 * A screenshot that follows the site theme: when the app has a dark-mode capture too,
 * both are rendered and CSS shows the one matching data-theme (the hidden one isn't fetched while lazy).
 */
export default function Shot({ file, alt, className = "", loading }: Props) {
  if (!hasDark(file)) return <img className={className} {...imgProps(file)} alt={alt} loading={loading} />;
  const dark = file.replace(/\.png$/, "-dark.png");
  return (
    <>
      <img className={`${className} on-light`} {...imgProps(file)} alt={alt} loading={loading} />
      <img className={`${className} on-dark`} {...imgProps(dark)} alt={alt} loading="lazy" />
    </>
  );
}
