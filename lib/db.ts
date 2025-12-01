import { Pool } from "pg";

export const db = new Pool({
    // This will use environment variables PGHOST, PGDATABASE, PGUSER, PGPASSWORD
});
