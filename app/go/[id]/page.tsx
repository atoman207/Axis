import { notFound, redirect } from "next/navigation";
import { getPortfolio } from "@/lib/portfolio/db";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function GoToSite({ params }: Params) {
  const { id } = await params;
  const portfolio = await getPortfolio();
  const site = portfolio.categories
    .flatMap((category) => category.sites)
    .find((item) => item.id === id);

  if (!site) notFound();
  redirect(site.url);
}
