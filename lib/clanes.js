export const CLANES = [
  { id: "ritchie", nombre: "Ritchie" },
  { id: "nakamoto", nombre: "Nakamoto" },
  { id: "ubuntu", nombre: "Ubuntu" },
  { id: "tesla", nombre: "Tesla" },
];

export const CLAN_IDS = CLANES.map((c) => c.id);

// Células con las que arranca cada clan. Después se editan desde el panel del TL.
export const CELULAS_INICIALES = [
  "Odin", "Hades", "Zeus", "Susanoo", "Poseidon", "Ra", "Amaterasu", "Anubis",
];
