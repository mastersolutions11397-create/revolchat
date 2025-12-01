const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  // Load environment variables
  require("dotenv").config();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error(
      "Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // Read the migration file
    const migrationPath = path.join(
      __dirname,
      "..",
      "supabase",
      "migrations",
      "001_create_credits_and_plans.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    console.log("Running migration...");

    // Execute the migration
    const { data, error } = await supabase.rpc("exec_sql", {
      sql: migrationSQL,
    });

    if (error) {
      console.error("Migration failed:", error);

      // Try executing as separate statements
      console.log("Trying to execute statements individually...");
      const statements = migrationSQL
        .split(";")
        .filter((stmt) => stmt.trim().length > 0);

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            const { error: stmtError } = await supabase.rpc("exec_sql", {
              sql: statement.trim() + ";",
            });
            if (stmtError) {
              console.error(
                "Statement failed:",
                statement.trim().substring(0, 100) + "..."
              );
              console.error("Error:", stmtError);
            } else {
              console.log("✓ Statement executed successfully");
            }
          } catch (stmtErr) {
            console.error("Statement error:", stmtErr);
          }
        }
      }
    } else {
      console.log("✓ Migration completed successfully!");
    }
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
}

runMigration();
