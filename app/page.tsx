import { CaseNow } from "@/components/public/CaseNow";
import { Footer } from "@/components/public/Footer";
import { Hero } from "@/components/public/Hero";
import { LiveStock } from "@/components/public/LiveStock";
import { Menu } from "@/components/public/Menu";
import { Story } from "@/components/public/Story";
import { Visit } from "@/components/public/Visit";
import { PreorderForm } from "@/components/public/PreorderForm";
import { getInventory, getMenu } from "@/lib/store";
import { stripeSandboxEnabled } from "@/lib/stripe";

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
        <section id="preorder" aria-labelledby="preorder-heading">
          <PreorderForm
            menu={menu}
            stripeEnabled={stripeSandboxEnabled()}
            initialNow={new Date().toISOString()}
          />
        </section>
        <Footer />
      </main>
    </LiveStock>
  );
}
