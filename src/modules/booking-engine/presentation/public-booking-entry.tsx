import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./../../../index.css";
import { PublicBookingSearch } from "./PublicBookingSearch";

const mount = document.getElementById("booking-search-island");

if (mount) {
  const initialGuests = Number(mount.dataset.guests ?? "2");
  createRoot(mount).render(
    <StrictMode>
      <PublicBookingSearch
        initialFrom={mount.dataset.from ?? ""}
        initialGuests={Number.isFinite(initialGuests) ? initialGuests : 2}
        initialTo={mount.dataset.to ?? ""}
      />
    </StrictMode>,
  );
}
