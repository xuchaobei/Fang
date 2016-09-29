import Zone from '../schemas/ZoneSchema';
import request from 'koa-request';

/*var sh_region = [{
  "name": "pudongxinqu",
  "cname": "浦东",
  "num": 10
}];*/
var sh_region = [{
  "name": "minhang",
  "cname": "闵行",
  "num": 76
}, {
  "name": "xuhui",
  "cname": "徐汇",
  "num": 100
}, {
  "name": "pudongxinqu",
  "cname": "浦东",
  "num": 100
}, {
  "name": "putuo",
  "cname": "普陀",
  "num": 52
}, {
  "name": "changning",
  "cname": "长宁",
  "num": 81
}, {
  "name": "jingan",
  "cname": "静安",
  "num": 64
}, {
  "name": "huangpu",
  "cname": "黄浦",
  "num": 100
}, {
  "name": "fengxian",
  "cname": "奉贤",
  "num": 26
}, {
  "name": "hongkou",
  "cname": "虹口",
  "num": 72
}, {
  "name": "zhabei",
  "cname": "闸北",
  "num": 53
}, {
  "name": "yangpu",
  "cname": "杨浦",
  "num": 71
}, {
  "name": "baoshan",
  "cname": "宝山",
  "num": 48
}, {
  "name": "songjiang",
  "cname": "松江",
  "num": 49
}, {
  "name": "jiading",
  "cname": "嘉定",
  "num": 49
}, {
  "name": "qingpu",
  "cname": "青浦",
  "num": 33
}, {
  "name": "jinshan",
  "cname": "金山",
  "num": 20
}, {
  "name": "chongming",
  "cname": "崇明",
  "num": 11
}];

const sh_zones_url = "http://sh.lianjia.com/xiaoqu";

var delayTime = 3*60*1000;   //毫秒

exports.getVisibleZones = function*() {
  const swX = this.query.swx;
  const swY = this.query.swy;
  const neX = this.query.nex;
  const neY = this.query.ney;

  const zones = yield Zone.find({
    x: {
      $gt: swX,
      $lt: neX
    },
    y: {
      $gt: swY,
      $lt: neY
    }
  }).select("name x y xqdata");

  this.body = {
    zones: zones
  };
}

exports.searchZones = function*() {
  const zoneName = this.query.zone_name;
  const reg = new RegExp("^.*" + zoneName + ".*$");
  const zones = yield Zone.find({
    name: reg
  })

  this.body = {
    zones: zones
  };
}

exports.crawler = function*() {
  yield getZoneList();
  this.body = {
    state: 0
  }
}

function* getZoneList() {
  let page = 1;
  const size = sh_region.length;
  for (let i = 0; i < size; i++) {
    const region = sh_region[i].name;
    console.log("开始遍历-----" + region);

    for (let j = 1; j <= sh_region[i].num; j++) {

      try {
        const regionUrl = sh_zones_url + "/" + region + "/d" + j;
        console.log("第" + j + "页-----" + regionUrl);

        const response = yield request({
          url: regionUrl
        });
        const zoneIDs = getZoneCID(response.body);

        for (let k = 0; k < zoneIDs.length; k++) {
          try {
            const zoneUrl = sh_zones_url + "/" + zoneIDs[k] + ".html";
            console.log("开始查询小区：" + zoneIDs[k] + "-----" + zoneUrl);

            const zoneResponse = yield request({
              url: zoneUrl
            });
            const zoneBody = zoneResponse.body;
            const zoneInfo = getZoneInfo(zoneBody);
            const houseForSale = getAmountForSale(zoneBody);
            const totalAmount = getTotalAmount(zoneBody);


            const zoneData = yield getZonePrice(zoneBody, zoneIDs[k])
            const zone = new Zone({
              city: "shanghai",
              district: region,
              name: zoneInfo[1],
              cid: zoneIDs[k],
              x: zoneInfo[0][0],
              y: zoneInfo[0][1],
              amount: houseForSale,
              total: totalAmount[0],
              xqdata: zoneData
            });
            yield zone.save();

            //延时一段时间，防止请求频率太快被服务器拒绝
            delayAPeriod(500);
          } catch (e) {
            console.error(e);
            delayAPeriod(delayTime);
            k--;
          }
        }
      } catch (e) {
        console.error(e);
        delayAPeriod(delayTime);
        j--;
      }
    }
  }
}

function getZoneCID(body) {
  var regZoneID = /xiaoqu.[0-9]{5,30}/g;
  var allIds = body.match(regZoneID);
  var zoneCID = [];
  //每个小区的id都出现两次，循环时跳过第二次的处理
  for (var x = 0; x < allIds.length; x = x + 2) {
    allIds[x] = allIds[x].slice(7);
    zoneCID.push(allIds[x]);
  }
  return zoneCID;
}

function getTotalAmount(body) {
  var repbody = body.replace(/[\r\n]/g, "");
  //var reg_total = /房屋总数..{0,100}/g
  var reg1 = /房屋总数.*<\/span>/;
  var reg2 = /[0-9]{2,10}/g
  var rawAmount = repbody.match(reg1);
  var totalAmount = 0;
  if (rawAmount[0]) {
    totalAmount = rawAmount[0].match(reg2);
  } else {
    console.error("小区房屋总数解析错误：" + body);
  }
  return totalAmount;
}

function getAmountForSale(body) {
  var regAmount = /在售二手房..[0-9]{0,6}/g;
  var rawAmount = body.match(regAmount);
  var amount = 0;
  if (rawAmount && rawAmount.length > 0) {
    amount = rawAmount[0].slice(6);
  } else {
    console.error("在售二手房总数解析错误: " + body);
  }
  return amount;
}

function getZoneInfo(body) {
  //var reg_name = /<h1>..{2,20}[\u4e00-\u9fa5_0-9_][^\s*|]/g
  var regName = /<h1>.{2,20}<\/h1>/g;
  var rawName = body.match(regName);
  console.log("zone= " + rawName);
  var data = [];
  if (rawName) {
    var name = rawName[0].slice(4, -5);
    var regXY = /xiaoqu=..{50}/g;
    var rawXY = body.match(regXY);
    if (rawXY) {
      rawXY = rawXY[0].slice(9);
      var comma1 = rawXY.indexOf(",");
      var y = rawXY.slice(0, comma1);
      rawXY = rawXY.slice(comma1 + 2);
      var comma2 = rawXY.indexOf(",");
      var x = rawXY.slice(0, comma2);
      var pos = [x, y];
      data = [pos, name];
    } else {
      console.error("小区信息解析错误: " + body);
    }
  } else {
    console.error("小区信息解析错误: " + body);
  }

  return data;
}

function* getZonePrice(body, propertyId) {
  //http://sh.lianjia.com/xiaoqu/getStatics.json?propertyId=5011000017872&plateId=611900136
  var regPlate = /plateId...{0,100}/g
  var reg = /[0-9]{5,20}/g
  var rawPlateId = body.match(regPlate)
  var plateId = rawPlateId[0].match(reg)
  var baseURL = "http://sh.lianjia.com/xiaoqu/getStatics.json?propertyId="
  var dataURL = baseURL + propertyId + "&plateId=" + plateId[0];

  const response = yield request({
    url: dataURL
  });

  console.log("price url = -----", dataURL)
  var jsonData = JSON.parse(response.body);

  var update = jsonData.updateMonth;
  var avgPrice = jsonData.propertyAvg;
  var monthAvgprice = jsonData.propertyAvgList;
  var monthList = jsonData.monthList;
  var ratioYear = jsonData.propertyAvgYear;
  var ratioMonth = jsonData.propertyAvgMonth;

  var priceData = {
    "update": update,
    "avg_price": avgPrice,
    "avg_price_list": monthAvgprice,
    "month_list": monthList,
    "ratio_month": ratioMonth,
    "ratio_year": ratioYear
  };

  return priceData;
}

function delayAPeriod(numberMillis) {
  var now = new Date();
  var exitTime = now.getTime() + numberMillis;
  while (true) {
    now = new Date();
    if (now.getTime() > exitTime)
      return;
  }
}