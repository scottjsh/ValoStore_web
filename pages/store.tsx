import { Display, Page, Text, Image, Grid, Button } from "@geist-ui/core";
import { useAuth } from "hooks/useAuth";
import { useStore } from "hooks/useStore";
import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Countdown from "react-countdown";

const Store: NextPage = () => {
  const router = useRouter();
  const { loading: authLoading, authBundle, clearAuthBundle } = useAuth();

  // Store only ever renders if the authBundle is present
  const {
    loading: storeLoading,
    store,
    error: storeError,
  } = useStore(authBundle!);

  useEffect(() => {
    if (!authLoading && !authBundle) {
      router.push("/");
    }
  }, [authLoading]);

  const logout = () => {
    clearAuthBundle();
    router.push("/");
  };

  return (
    <Page>
      {storeLoading ? (
        <span>loading...</span>
      ) : (
        <>
          <Text h1>Your Store</Text>
          <Text>
            Time remaining:{" "}
            <Countdown date={Date.now() + store!.storefrontReset * 1000} />
          </Text>
          <Grid.Container gap={2} justify="center">
            {/* if not loading, not null */}
            {store!.offers.map((offer) => (
              <Grid xs={24} md={12} lg={6} key={offer.displayName}>
                <Display shadow caption={offer.displayName}>
                  <Image src={offer.displayIcon} padding="1rem" height="14rem" />
                </Display>
              </Grid>
            ))}
          </Grid.Container>
          {store!.nightMarket && (
            <>
              <Text h1>Your Night Market</Text>
              <Text>
                Night Market time remaining:{" "}
                <Countdown
                  date={Date.now() + store!.nightMarket.nightMarketReset * 1000}
                />
              </Text>
            </>
          )}
          <Grid.Container gap={2} justify="center">
            {store!.nightMarket?.offers.map((offer) => (
              <Grid xs={24} md={12} lg={6} key={offer.storeItem.displayName}>
                <Display
                  shadow
                  caption={
                    offer.storeItem.displayName +
                    " | Price: " +
                    offer.discountPrice.toString() +
                    " VP"
                  }
                >
                  <Image
                    src={offer.storeItem.displayIcon}
                    padding="1rem"
                    height="14rem"
                  />
                </Display>
              </Grid>
            ))}
          </Grid.Container>

          {storeError && <span>Error fetching store: {storeError}</span>}
          <Button onClick={() => logout()} ghost>
            Log Out
          </Button>
        </>
      )}
      <Page.Footer>
        <Text type="secondary">scottjsh © 2024</Text>
      </Page.Footer>
    </Page>
  );
};

export default Store;
