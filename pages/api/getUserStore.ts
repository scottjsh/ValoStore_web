import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";
import { SKINS_JSON, UpdateStoreResponse } from "./updateStore";

export default async function getUserStore(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { authorizationToken, entitlementsToken, puuid, region } = req.body;
  
  let version = (await axios.get("https://valorant-api.com/v1/version")).data;

  const storefrontResponse = await axios.get(
    `https://pd.${region}.a.pvp.net/store/v2/storefront/${puuid}`,
    {
      headers: {
        "X-Riot-ClientPlatform": "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9",
        "X-Riot-ClientVersion": version["data"]["riotClientVersion"],
        "X-Riot-Entitlements-JWT": entitlementsToken,
        Authorization: `Bearer ${authorizationToken}`,
      },
    }
  );
  const storefrontData = storefrontResponse.data;
  const skinsPanelRaw = storefrontResponse.data.SkinsPanelLayout;

  // const skinsMapRaw = await fs.readFile(SKINS_JSON, "utf-8");
  // const skinsMap: { [uuid: string]: UpdateStoreResponse } =
  //   JSON.parse(skinsMapRaw);

  let lang = "en-US";
  if (region === "KR") { lang = "ko-KR"; }

  let store_data = (await axios.get(`https://valorant-api.com/v1/weapons/skinlevels?language=${lang}`)).data.data;

  // const allDisplayNames = JSON.stringify(req_data.map((data: any) => data.displayName));
  // const allDisplayIcons = JSON.stringify(req_data.map((data: any) => data.displayIcon));

  const store: UserStoreResponse = {
    storefrontReset: Number.parseInt(
      skinsPanelRaw.SingleItemOffersRemainingDurationInSeconds
    ),
    // offers: JSON.parse(`{ "displayName": ${allDisplayNames}, "image": ${allDisplayIcons} }`)
    offers: skinsPanelRaw.SingleItemOffers.map(
      (uuid: string) => store_data.find((data: any) => data.uuid === uuid)
    ),
  };


  if (storefrontData.BonusStore) {
    store.nightMarket = {
      nightMarketReset:
        storefrontData.BonusStore.BonusStoreRemainingDurationInSeconds,
      offers: storefrontData.BonusStore.BonusStoreOffers.map(
        (item: BonusStoreOffer) => ({
          storeItem: store_data.find((data: any) => data.uuid === item.Offer.OfferID),
          discountPrice: Object.values(item.DiscountCosts)[0],
        })
      ),
    };
  }

  res.status(200).send(store);
}

type BonusStoreOffer = {
  Offer: {
    OfferID: string;
  };
  DiscountCosts: Array<{ [uuid: string]: number }>;
};

export type NightMarketItem = {
  storeItem: UpdateStoreResponse;
  discountPrice: number;
};

export type UserStoreResponse = {
  storefrontReset: number;
  offers: UpdateStoreResponse[];
  nightMarket?: {
    nightMarketReset: number;
    offers: NightMarketItem[];
  };
};
