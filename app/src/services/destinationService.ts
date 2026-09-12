import { api } from "./api";
import type { Destination, DestinationFilters } from "@/types/destination";

export async function getDestinations(filters?: DestinationFilters): Promise<Destination[]> {
  const { data } = await api.get("/destinations", { params: filters });
  return data;
}

export async function getDestinationBySlug(slug: string): Promise<Destination> {
  const { data } = await api.get(`/destinations/${slug}`);
  return data;
}

export async function getDestinationWeather(slug: string) {
  const { data } = await api.get(`/destinations/${slug}/weather`);
  return data;
}

export async function getDestinationBudget(
  slug: string,
  currency: string,
  tier: "budget" | "midRange" | "luxury"
) {
  const { data } = await api.get(`/destinations/${slug}/budget`, {
    params: { currency, tier },
  });
  return data;
}

export async function getDestinationWildlife(slug: string) {
  const { data } = await api.get(`/destinations/${slug}/wildlife`);
  return data;
}
