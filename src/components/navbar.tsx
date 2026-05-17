import { getCantinaRepository } from "@/server/data";
import { NavbarClient, type ActiveItem } from "./navbar-client";

export default function Navbar({ activeItemID }: { activeItemID: ActiveItem }) {
  const groups = getCantinaRepository().getCollectionGroups();
  return <NavbarClient activeItemID={activeItemID} groups={groups} />;
}
