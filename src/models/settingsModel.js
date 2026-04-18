// settingsModel.js
// This file is responsible for ALL database operations on the settings table
// The settings table stores things like whether the simulator is running or not

import supabase from "./supabase.js";

/**
 * Gets the value of a specific settings key from the database
 * Example: getSetting("simulator_running") returns "true" or "false"
 * Called by: api/toggle-simulator.js
 */
export async function getSetting(key) {
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", key)
    .single();

  // If Supabase returns an error, throw it so the controller can handle it
  if (error) throw new Error(error.message);
  return data.value;
}

/**
 * Updates the value of a specific settings key in the database
 * Example: updateSetting("simulator_running", "true")
 * Called by: api/toggle-simulator.js
 */
export async function updateSetting(key, value) {
  const { error } = await supabase
    .from("settings")
    .update({ value })
    .eq("key", key);

  // If Supabase returns an error, throw it so the controller can handle it
  if (error) throw new Error(error.message);
}