import { api } from "./api";
import type { Itinerary, ItineraryInput } from "@/types/itinerary";

export async function getMyItineraries(): Promise<Itinerary[]> {
  const { data } = await api.get<Itinerary[]>("/itineraries");
  return data;
}

export async function getItinerary(id: string): Promise<Itinerary> {
  const { data } = await api.get<Itinerary>(`/itineraries/${id}`);
  return data;
}

export async function createItinerary(input: ItineraryInput): Promise<Itinerary> {
  const { data } = await api.post<Itinerary>("/itineraries", input);
  return data;
}

export async function updateItinerary(id: string, input: ItineraryInput): Promise<Itinerary> {
  const { data } = await api.put<Itinerary>(`/itineraries/${id}`, input);
  return data;
}

export async function deleteItinerary(id: string): Promise<void> {
  await api.delete(`/itineraries/${id}`);
}
