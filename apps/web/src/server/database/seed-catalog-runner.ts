import { seedCatalog } from "./seed-catalog";

seedCatalog()
  .then((count) => {
    console.log(`Catalog upserted ${count} manuscript universes.`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
