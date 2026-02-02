
import dotenv from 'dotenv';
import fs from 'fs';
import { createClient } from 'next-sanity';

// Load env vars
dotenv.config({ path: '.env.local' });

 const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
 const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
 const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-02-01';
 const token = process.env.SANITY_API_TOKEN;

if (!token) {
  console.error("Missing SANITY_API_TOKEN");
  process.exit(1);
}

export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

async function uploadBackground() {
  const filePath = '/home/z3tz3r0/.gemini/antigravity/brain/73661baa-6638-4662-afd3-27ffd526d931/cta_meeting_room_clean_1769967443847.png';
  if (!fs.existsSync(filePath)) {
      console.error("File not found:", filePath);
      return;
  }

  const file = fs.createReadStream(filePath);
  
  console.log("Uploading generated background...");
  try {
      const asset = await writeClient.assets.upload('image', file, {
          filename: 'cta_meeting_room_clean.png'
      });
      console.log("Asset Uploaded:");
      console.log(asset._id);
  } catch (err) {
      console.error("Upload failed", err);
  }
}

uploadBackground();
