import menuCopyJson from "@/content/menu-copy.json";

// Generated copy and photos (lane F). Keyed by menu item id and stock groupId.
export type CopyEntry = {
  description: string;
  image: string; // empty string = no photo, use the SVG illustration
  imageAlt: string;
};

export const menuCopy: Record<string, CopyEntry | undefined> = menuCopyJson;
