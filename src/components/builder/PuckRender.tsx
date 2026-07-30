"use client";

import { Render, type Data } from "@measured/puck";
import "@measured/puck/puck.css";
import { puckConfig } from "@/lib/puck/config";

/** Read-only public render of a Puck layout (events, posts, pages). */
export function PuckRender({ data }: { data: Data }) {
  return <Render config={puckConfig} data={data} />;
}
