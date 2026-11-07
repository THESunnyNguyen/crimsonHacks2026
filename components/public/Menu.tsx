import { categoryNames, site } from "@/content/site";
import type { MenuItem } from "@/lib/types";
import { menuCopy } from "./copy";
import type { Shape } from "./Illustration";
import { Picture } from "./Picture";

const categories = Object.keys(categoryNames) as MenuItem["category"][];

// Fallback art for items that have no generated photo.
const shapes: Record<string, Shape> = {
  fritter: "fritter",
  "cinnamon-roll": "roll",
  "cream-cheese-croissant": "croissant",
  filled: "filled",
  "buttermilk-bar": "bar",
};
const shapeFor = (item: MenuItem): Shape =>
  item.category === "deli" ? "sandwich" : (shapes[item.id] ?? "ring");

const price = (p: number | null) =>
  p === null ? site.askAtCounter : `$${p.toFixed(2)}`;

export function Menu({ menu }: { menu: MenuItem[] }) {
  return (
    <section id="menu" className="scroll-mt-6 space-y-8">
      <div className="space-y-2">
        <h2 className="font-display text-3xl text-accent sm:text-4xl">{site.menuHeading}</h2>
        <p className="text-sm text-cocoa/80">{site.menuNote}</p>
      </div>
      {categories.map((category) => {
        const items = menu.filter((m) => m.category === category);
        if (items.length === 0) return null;
        const group = menuCopy[category];
        return (
          <div key={category} className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <h3 className="font-display text-2xl">
                {categoryNames[category]}
              </h3>
              <p className="text-sm font-bold">
                {items[0].price === null
                  ? site.askAtCounter
                  : `${price(items[0].price)} each`}
              </p>
            </div>
            {group?.description && (
              <p className="text-sm text-cocoa/80">{group.description}</p>
            )}
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {items.map((item) => {
                const copy = menuCopy[item.id];
                return (
                  <li
                    key={item.id}
                    className="flex flex-col gap-2 rounded-theme border border-cocoa/15 bg-paper p-3"
                  >
                    <Picture
                      src={copy?.image}
                      alt={copy?.imageAlt ?? item.name}
                      shape={shapeFor(item)}
                    />
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="font-bold leading-tight">{item.name}</h4>
                      {item.price !== null && (
                        <span className="shrink-0 font-bold">
                          {price(item.price)}
                        </span>
                      )}
                    </div>
                    {copy?.description && (
                      <p className="text-sm text-cocoa/80">{copy.description}</p>
                    )}
                    {item.options && (
                      <p className="text-sm">
                        Options: {item.options.join(" · ")}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
            {category === "cake" && (
              <p className="text-sm font-bold">{site.cakeToppings}</p>
            )}
          </div>
        );
      })}
    </section>
  );
}
