if (fs.existsSync("data/valid_pair_library.json")) {
  let valid_pair_library = JSON.parse(
    fs.readFileSync("data/valid_pair_library.json")
  );
} else {
  valid_pair_library = false;
}

async function checkNewAdd(pair, pairArray) {
  let exists = valid_pair_library.filter(function (element) {
    return (
      element.dex === dex &&
      ((element.token0 === tokena && element.token1 === tokenb) ||
        (element.token0 === tokenb && element.token1 === tokena))
    ); //return
  });
  if (exists) {
    console.log(exists);
    console.log("pair exists");
    pairArray.push(
      newElement(
        exists[0].dex,
        exists[0].token0,
        exists[0].token1,
        exists[0].pair_address
      )
    );
    return true;
  } else {
    return false;
  }
}
