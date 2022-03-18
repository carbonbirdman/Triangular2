# Triangular searcher

"tokens":
"node scripts/decimals.js
&& node scripts/prices.js
&& node scripts/factories.js",

    "pairs":
    "node scripts/pairs.js
    && node scripts/reserves.js
    &

    "routes":
    "node scripts/generate.js",

    "simulate":
     "node scripts/simulate_solid.js",

    "runall":
    "node scripts/decimals.js  -> "data/tokens.json"
    && node scripts/prices.js  -> data/token_price.json
    && node scripts/factories.js
    && node scripts/pairs.js -> "data/all_pairs.json"
    && node scripts/reserves.js  ->  data/reserves.json
     && node scripts/validate_pairs.js", "data/validated_pairs.json
    "data/validated_pairs.json > node scripts/generate.js -> "data/generated.json"
    && node scripts/simulate_solid.js"

},

https://github.com/solidlyexchange/solidly

The solidly code is very useful:
https://github.com/solidlyexchange/solidly.exchange/blob/b5faba84f64dd7367dc0a63b149c782bea0c3ac0/stores/stableSwapStore.js
