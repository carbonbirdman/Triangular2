const dx = require("../src/dexes");

test("get connection", () => {
  expect(dx.get_connection()).toBeDefined();
});
