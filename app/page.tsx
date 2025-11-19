import dynamic from "next/dynamic";

const BuilderShell = dynamic(() => import("@/components/builder/BuilderShell").then((mod) => mod.BuilderShell), {
  ssr: false
});

export default function Home() {
  return <BuilderShell />;
}
