import { redirect } from "next/navigation";

// Library moved to /library — keep the old path working.
export default () => redirect("/library");
