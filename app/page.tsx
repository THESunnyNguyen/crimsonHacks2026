import { CaseNow } from "@/components/public/CaseNow";
import { Footer } from "@/components/public/Footer";
import { Hero } from "@/components/public/Hero";
import { LiveStock } from "@/components/public/LiveStock";
import { Menu } from "@/components/public/Menu";
import { Story } from "@/components/public/Story";
import { Visit } from "@/components/public/Visit";
import { getInventory, getMenu } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [menu, inventory] = await Promise.all([getMenu(), getInventory()]);
  return (
    <LiveStock initial={inventory}>
      <main className="mx-auto max-w-3xl space-y-12 px-4 pb-10 sm:px-6">
        <Hero />
        <CaseNow />
        <Menu menu={menu} />
        <Story />
        <Visit />
        {/* Lane E mounts the hold-a-dozen pre-order here. */}
        <section id="preorder" />
        <Footer />
      </main>
    </LiveStock>
  );
}
