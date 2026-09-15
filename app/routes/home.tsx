import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "#TheIVLeague" },
    { name: "description", content: "Celebrate with us, #TheIVLeague" },
  ];
}

export default function Home() {
  return <Welcome />;
}
