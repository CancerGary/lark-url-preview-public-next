const fs = require("node:fs");
const path = require("node:path");
fs.writeFileSync(
  path.join(__dirname, "node_modules/handlebars-helpers/lib/utils/utils.js"),
  fs.readFileSync(path.join(__dirname, "handlebars-helpers-patch.js")),
);
