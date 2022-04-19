// Examine historical prices and liquidity using
// GraphQL

// FIRST USE APOLLO TO LOOK AT POOLS

import { request, gql } from "graphql-request";
//  gql string literal which is a fancy string template
const POOLS = gql`
  query {
    pools(first: 5, orderBy: "totalSwapVolume", orderDirection: desc) {
      id
      totalSwapVolume
      tokens {
        symbol
        address
        balance
      }
    }
  }
`;

console.log(POOLS);

request(
  "https://graph-node.beets-ftm-node.com/subgraphs/name/beethovenx",
  POOLS
).then((data) => console.log(data));

//const beetAddress = "0xDb8B0449FE89cF8251c9029827fDA3f11Ed7150e";
//const tarotBorrowableABI = require("../src/tarotBorrowable.json");
//const tarotBorrowableContract = new ethers.Contract(
//  tarotBorrowableAddress,
//  tarotBorrowableABI,
//  conn
//);

const BEETSURL =
  "https://graph-node.beets-ftm-node.com/subgraphs/name/beethovenx";

const SPOOKYURL =
  "https://thegraph.com/hosted-service/subgraph/eerieeight/spookyswap";

const SPIRITURL =
  "https://thegraph.com/hosted-service/subgraph/layer3org/spiritswap-analytics";

const spookyClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/eerieeight/spookyswap",
  cache: new InMemoryCache()
});

const spiritClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/layer3org/spiritswap-analytics",
  cache: new InMemoryCache()
});
//LQDR pair 0x4fe6f19031239f105f753d1df8a0d24857d0caa2

const beetsClient = new ApolloClient({
  uri: "https://graph-node.beets-ftm-node.com/subgraphs/name/beethovenx",
  cache: new InMemoryCache()
});

const spiritQuery = gql`
  query {
    pairs(where: { id: "0x4fe6f19031239f105f753d1df8a0d24857d0caa2" }) {
      token0 {
        id
        symbol
        name
      }
      token1 {
        id
        symbol
        name
      }
      token0Price
      token1Price
    }
  }
`;

const spookyQuery = gql`
  query {
    pairs(where: { id: "0x506ddcc751c7d500f983ffda6ddefbe458ba2c33" }) {
      token0 {
        symbol
      }
      token1 {
        symbol
      }
      token0Price
      token1Price
    }
  }
`;

const beetsQuery = gql`
  query {
    tokenPrices(
      where: { asset: "0x10b620b2dbAC4Faa7D7FFD71Da486f5D44cd86f9" }
      orderDirection: desc
      orderBy: "block"
      first: 1
    ) {
      id
      price
    }
  }
`;


useQuery(spiritQuery);

useQuery(spookyQuery);

useQuery(beetsQuery);

Spirit{" "}
<a href="https://thegraph.com/hosted-service/subgraph/layer3org/spiritswap-analytics?selected=playground">

        Spooky{" "}
        <a href="https://thegraph.com/hosted-service/subgraph/eerieeight/spookyswap">


        Beets{" "}
        <a href="https://graph-node.beets-ftm-node.com/subgraphs/name/beethovenx/graphql">
          explore


