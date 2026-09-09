import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Skills } from "@/components/sections/Skills";
import { Studies } from "@/components/sections/Studies";
import { Certifications } from "@/components/sections/Certifications";
import { Projects } from "@/components/sections/Projects";
import { Contact } from "@/components/sections/Contact";

export default async function HomePage({
  params,
}: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Studies />
      <Certifications />
      <Projects />
      <Contact />
    </>
  );
}
