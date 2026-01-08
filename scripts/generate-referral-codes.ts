/**
 * Script to generate referral codes for existing users
 * Run with: npx tsx scripts/generate-referral-codes.ts
 */

import { createClient } from "@supabase/supabase-js";
import { generateReferralCode } from "../lib/utils/referral-code";
import * as dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function generateReferralCodesForExistingUsers() {
  console.log("Starting referral code generation for existing users...");

  // Get all users
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

  if (usersError) {
    console.error("Error fetching users:", usersError);
    process.exit(1);
  }

  console.log(`Found ${users.users.length} users`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const user of users.users) {
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from("user_profiles")
        .select("referral_code")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingProfile) {
        console.log(`Skipping user ${user.email} - already has code: ${existingProfile.referral_code}`);
        skipped++;
        continue;
      }

      // Generate referral code
      const username = user.email?.split("@")[0] || "USER";
      let referralCode = generateReferralCode(username);

      // Ensure uniqueness
      let attempts = 0;
      while (attempts < 10) {
        const { data: existing } = await supabase
          .from("user_profiles")
          .select("referral_code")
          .eq("referral_code", referralCode)
          .maybeSingle();

        if (!existing) {
          break; // Code is unique
        }

        referralCode = generateReferralCode(username);
        attempts++;
      }

      // Create profile
      const { error: createError } = await supabase
        .from("user_profiles")
        .insert({
          user_id: user.id,
          referral_code: referralCode,
          total_earnings: 0,
          total_referrals: 0,
        });

      if (createError) {
        console.error(`Error creating profile for ${user.email}:`, createError);
        errors++;
      } else {
        console.log(`Created referral code for ${user.email}: ${referralCode}`);
        created++;
      }
    } catch (error) {
      console.error(`Error processing user ${user.email}:`, error);
      errors++;
    }
  }

  console.log("\n=== Summary ===");
  console.log(`Created: ${created}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log("Done!");
}

generateReferralCodesForExistingUsers().catch(console.error);

