import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import axios from "axios";
import path from "path";
import fs from "fs/promises";

const { JSON_UPLOAD_SECRET } = process.env;

export type SkinTier = "Select" | "Deluxe" | "Premium" | "Ultra" | "Exclusive";
export type ValorantApiSkin = {
  displayName: string;
  contentTierUuid: string;
  displayIcon: string;
  levels: Array<{
    uuid: string;
    displayIcon: string;
  }>;
};
export const SkinTierUUIDs: { [uuid: string]: SkinTier } = {
  "12683d76-48d7-84a3-4e09-6985794f0445": "Select",
  "0cebb8be-46d7-c12a-d306-e9907bfc5a25": "Deluxe",
  "60bca009-4182-7998-dee7-b8a2558dc369": "Premium",
  "411e4a55-4e59-7757-41f0-86a53f101bb5'": "Ultra",
  "e046854e-406c-37f4-6607-19a9ba8426fc": "Exclusive",
};
export const SKINS_JSON = path.join("assets", "skins.json");

export default async function updateStore(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { key } = req.body;
  const secretBuffer = Buffer.from(JSON_UPLOAD_SECRET);
  const keyBuffer = Buffer.from(key);

  if (
    secretBuffer.length !== keyBuffer.length ||
    !crypto.timingSafeEqual(secretBuffer, keyBuffer)
  ) {
    res.status(400).send("Error authorizing store update request!");
    return;
  }

  const skinsJsonResponse = await axios.get<{ data: ValorantApiSkin[] }>(
    "https://valorant-api.com/v1/weapons/skins"
  );
  const { data: skinsContent } = skinsJsonResponse.data;

  const skinsReformatted = {} as {
    [uuid: string]: UpdateStoreResponse;
  };
  skinsContent.forEach((skin) => {
    const baseSkin = skin.levels[0];

    skinsReformatted[baseSkin.uuid] = {
      displayName: skin.displayName,
      displayIcon: baseSkin.displayIcon,
      skinTier: SkinTierUUIDs[skin.contentTierUuid],
    };
  });

  await fs.writeFile(SKINS_JSON, JSON.stringify(skinsReformatted));
  res.status(200).send("Successful!");
}

export type UpdateStoreResponse = {
  displayName: string;
  displayIcon: string;
  skinTier: SkinTier;
};
