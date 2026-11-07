import { BasicStock } from "@/components/public/BasicStock";
import { categoryNames, site } from "@/content/site";
import { getInventory, getMenu } from "@/lib/store";
import { isOpenNow } from "@/lib/time";
import type { MenuItem } from "@/lib/types";

export const dynamic = "force-dynamic";

const price = (p: number | null) =>
  p === null ? site.askAtCounter : `$${p.toFixed(2)}`;

// Basic skeleton page; lane B replaces it.
export default async function Home() {
  const [menu, inventory] = await Promise.all([getMenu(), getInventory()]);
  const categories = Object.keys(categoryNames) as MenuItem["category"][];
  return (
    <main className="mx-auto max-w-2xl space-y-8 p-6">
      <header>
        <h1 className="font-display text-4xl">{site.name}</h1>
        <p>{site.tagline}</p>
        <p className="mt-2 inline-block rounded-theme bg-frosting px-3 py-1 font-bold">
          {inventory.shopSoldOut
            ? site.soldOutToday
            : isOpenNow()
              ? site.openNow
              : site.closed}
        </p>
      </header>
      <BasicStock initial={inventory} />
      <section>
        <h2 className="font-display text-2xl">{site.menuHeading}</h2>
        {categories.map((c) => (
          <div key={c} className="mt-4">
            <h3 className="font-bold">{categoryNames[c]}</h3>
            <ul>
              {menu
                .filter((m) => m.category === c)
                .map((m) => (
                  <li key={m.id}>
                    {m.name}: {price(m.price)}
                    {m.options && ` (${m.options.join(", ")})`}
                  </li>
                ))}
            </ul>
            {c === "cake" && <p className="text-sm">{site.cakeToppings}</p>}
          </div>
        ))}
      </section>
      <section>
        <p>{site.address}</p>
        <p>
          <a className="underline" href={site.phoneHref}>
            {site.phone}
          </a>{" "}
          · {site.hours}
        </p>
        <a className="underline" href={site.mapUrl}>
          Get directions
        </a>
      </section>
      <section id="preorder" />
      <footer className="text-sm text-cocoa/70">{site.footer}</footer>
    </main>
  );
}
