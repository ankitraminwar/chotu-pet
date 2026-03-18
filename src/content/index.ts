import { PetWidget } from "./PetWidget";

const MOUNT_ID = "chotu-pet-host";

function mount(): void {
  if (document.getElementById(MOUNT_ID)) return;
  new PetWidget();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount, { once: true });
} else {
  mount();
}
