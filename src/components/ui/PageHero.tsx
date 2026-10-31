import Image from "next/image";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

type Crumb = { href: string; label: string };

type Props = {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  crumbs: Crumb[];
  image?: string;
};

export function PageHero({ eyebrow, title, description, crumbs, image = "/images/hero-slide-1.jpg" }: Props) {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-navy text-ivory">
      <Image src={image} alt="" fill className="object-cover opacity-25" sizes="100vw" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy/90 to-navy/70" aria-hidden="true" />
      <div className="relative container-page py-12 sm:py-16">
        <Breadcrumbs items={crumbs} light />
        {eyebrow ? (
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-gold-soft">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-3 max-w-4xl font-serif text-4xl leading-tight text-ivory sm:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-5 max-w-2xl text-base text-ivory/80 sm:text-lg">{description}</p>
        ) : null}
      </div>
    </section>
  );
}
