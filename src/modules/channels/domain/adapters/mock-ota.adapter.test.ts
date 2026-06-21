import { describe, expect, test } from "bun:test";
import { mockAgodaAdapter } from "./mock-ota.adapter";

describe("mockAgodaAdapter", () => {
  test("pushAvailability returns mapped room count", async () => {
    const result = await mockAgodaAdapter.pushAvailability({
      channel: {
        id: "channel_agoda",
        code: "agoda",
        name: "Agoda",
        isActive: true,
        config: null,
      },
      mappings: [
        {
          roomTypeId: "room-type-1",
          roomTypeName: "Standard",
          externalRoomTypeId: "AGD-STD",
          allotment: 1,
        },
      ],
      availability: [
        {
          roomTypeId: "room-type-1",
          roomTypeName: "Standard",
          basePrice: "450000",
          capacity: 2,
          totalRooms: 2,
          reservedRooms: 1,
          heldRooms: 0,
          availableRooms: 1,
        },
      ],
      from: "2026-07-01",
      to: "2026-07-05",
    });

    expect(result.pushedCount).toBe(1);
  });
});
