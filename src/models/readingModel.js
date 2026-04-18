// readingModel.js
// This file is responsible for ALL database operations on the device_readings table

import supabase from "./supabase.js";

/**
 * Inserts a single device reading into the database
 * Called by: api/add-reading.js
 */
export async function insertReading(device_id, value) {
  const { data, error } = await supabase
    .from("device_readings")
    .insert([{ device_id, value }]);

  // If Supabase returns an error, throw it so the controller can handle it
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Fetches the latest readings joined with device info
 * Called by: api/get-readings.js and api/sentinel.js
 */
export async function fetchLatestReadings(limit = 100) {
  const { data, error } = await supabase
    .from("device_readings")
    .select(`
      value,
      recorded_at,
      devices (
        device_id,
        device_type
      )
    `)
    .order("recorded_at", { ascending: false })
    .limit(limit);

  // If Supabase returns an error, throw it so the controller can handle it
  if (error) throw new Error(error.message);
  return data;
}