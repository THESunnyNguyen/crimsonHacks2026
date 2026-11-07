import { site } from "@/content/site";

export function Footer() {
  return (
    <footer className="border-t border-cocoa/15 pt-6 text-sm text-cocoa/70">
      {site.footer}
    </footer>
  );
}
