const fs = require("fs");
const pdf = require("pdf-parse");
const fastcsv = require("fast-csv");

const ws = fs.createWriteStream("out.csv");


const write = (data) => {
  fastcsv.write(data, { headers: true }).pipe(ws);
}

const dataBuffer = fs.readFileSync("./biggyboypeedee.pdf");

pdf(dataBuffer).then(data => {
  const found = data.text.match(/\n[a-zA-Z0-9 &-\/]+£\d+\.\d\d/g);
  const foundExtra = data.text.match(/[a-zA-Z &()]+\r[a-zA-Z &()]+(£\d+\.\d\d)/g);

  const combined = [...found, ...foundExtra];

  const foundEdit = combined.map(item => {
    item = item.replace(/\n/, "");
    if (/DIY|DVDs|MOT Testing/.test(item)) {
      item = item.replace(/([a-z]|DIY)([A-Z])/, "$1,$2")
    } else if (/\r/.test(item)) {
      item = item.replace(/(\w+[a-z])[A-Z].+\r(.+)(£\d+.\d\d)/, "$1,$2$3");
    } else {
      item = item.replace(/([a-zA-Z0-9\)])([A-Z])/, "$1,$2");
    }
    item = item.replace(/([a-zA-Z\)\.])(£)/, "$1,$2");

    const itemObject = {}
    item = item.split(",");
    itemObject.category = item[0];
    itemObject.product = item[1];
    itemObject.price = item[2];

    return itemObject;
  });

  write(foundEdit);
});