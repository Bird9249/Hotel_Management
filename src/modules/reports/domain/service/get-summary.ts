import type { DbClient } from "@/server/platform/db/client";
import type { DbTransaction } from "@/shared/types";
import { todayIso } from "../lib/date-range";
import {
  queryTodayArrivals,
  queryTodayBookingsBySource,
  queryTodayDepartures,
  queryTodayHkCompleted,
  queryTodayOccupancy,
  queryTodayRevenue,
} from "../repo/summary";

export async function getSummary(
  client: DbTransaction | DbClient,
  day = todayIso(),
) {
  const [
    revenue,
    occupancy,
    arrivals,
    departures,
    bookingsBySource,
    hkRoomsCompletedToday,
  ] = await Promise.all([
    queryTodayRevenue(client, day),
    queryTodayOccupancy(client, day),
    queryTodayArrivals(client, day),
    queryTodayDepartures(client, day),
    queryTodayBookingsBySource(client, day),
    queryTodayHkCompleted(client, day),
  ]);

  return {
    date: day,
    revenue,
    occupancy,
    arrivals,
    departures,
    bookingsBySource,
    hkRoomsCompletedToday,
  };
}
