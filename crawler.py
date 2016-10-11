#!/usr/bin/env python
# coding=utf-8
import urllib2
import re
import json
from pymongo import MongoClient

client = MongoClient()
db = client.map
urlBase = 'http://sh.lianjia.com/xiaoqu'
shRegions = [
    {
        "name": "pudongxinqu",
        "cname": "浦东",
    }, {
        "name": "minhang",
        "cname": "闵行",
    }, {
        "name": "baoshan",
        "cname": "宝山",
    }, {
        "name": "xuhui",
        "cname": "徐汇",
    }, {
        "name": "putuo",
        "cname": "普陀",
    }, {
        "name": "yangpu",
        "cname": "杨浦",
    }, {
        "name": "changning",
        "cname": "长宁",
    }, {
        "name": "songjiang",
        "cname": "松江",
    }, {
        "name": "jiading",
        "cname": "嘉定",
    }, {
        "name": "jingan",
        "cname": "静安",
    }, {
        "name": "huangpu",
        "cname": "黄浦",
    }, {
        "name": "hongkou",
        "cname": "虹口",
    }, {
        "name": "zhabei",
        "cname": "闸北",
    }, {
        "name": "qingpu",
        "cname": "青浦",
    }, {
        "name": "fengxian",
        "cname": "奉贤",
    }, {
        "name": "jinshan",
        "cname": "金山",
    }, {
        "name": "chongming",
        "cname": "崇明",
    }]


def crawler():
    for i in range(0, len(shRegions)):
        print '开始遍历:' + shRegions[i]['name']
        url = urlBase + '/' + shRegions[i]['name'] 
        response = urllib2.urlopen(url)
        page = getTotalPage(response.read())
        pageNum = int(page)
        for j in range(0, pageNum):
            url = urlBase + '/' + shRegions[i]['name'] + '/d' + str(j + 1)
            print('开始遍历第' + str(j + 1) + '页')
            response = urllib2.urlopen(url)
            zoneCID = getZoneCID(response.read())
            for zoneID in zoneCID:
                try:
                    zoneUrl = urlBase + "/" + zoneID + ".html"
                    print('开始查询小区:' + zoneUrl)
                    zoneResponse = urllib2.urlopen(zoneUrl).read()
                    zoneInfo = getZoneInfo(zoneResponse)
                    if zoneInfo is None:
                        continue
                    print zoneInfo[1]
                    houseForSale = getAmountForSale(zoneResponse)
                    totalAmount = getTotalAmount(zoneResponse)
                    zoneData = getZonePrice(zoneResponse, zoneID)

                    zone = {
                        "city": "shanghai",
                        "district": shRegions[i]["name"],
                        "name": zoneInfo[1],
                        "cid": zoneID 	,
                        "x": float(zoneInfo[0][0]),
                        "y": float(zoneInfo[0][1]),
                        "amount": houseForSale,
                        "total": totalAmount,
                        "xqdata": zoneData
                    }
                    zoneDB = db.zone.find_one(
                        {"cid": zone["cid"]}
                    )
                    if zoneDB is None:
                        db.zones.insert_one(zone)
                    else:
                        db.zones.update_one(
                            {"_id": zoneDB["_id"]},
                            {"$set": zone}
                        )
                except Exception, err:
                    print Exception, ":", err

def getTotalPage(response):
    pageNum = 0
    result = re.search(r'gahref="results_totalpage".*?(\d+)', response)
    if result is not None:
        pageNum = result.group(1)
    return pageNum

def getZoneCID(response):
    allIds = re.findall(r"xiaoqu.[0-9]{5,30}", response)
    zoneCID = []
    # 每个小区的id都出现两次，循环时跳过第二次的处理
    for x in range(0, len(allIds), 2):
        allIds[x] = allIds[x][7:]
        zoneCID.append(allIds[x])
    return zoneCID

def getZoneInfo(response):
    data = None
    result = re.search(r"<h1>(.{2,50})<\/h1>", response)
    if result is not None:
        name = result.group(1)
        result = re.search(r"xiaoqu=\"\[(.*),(.*),.*\]", response)
        if result is not None:
            x = result.group(1).strip()
            y = result.group(2).strip()
            position = [x, y]
            data = [position, name]
    return data


def getAmountForSale(response):
    result = re.search(r"在售二手房.*?([0-9]{1,20})", response)
    amount = 0
    if result is not None:
        amount = result.group(1)
    else:
        print("在售二手房总数解析错误: ")
    return amount


def getTotalAmount(response):
    result = re.search(r"房屋总数.*?([0-9]{1,20})户", response, re.S)
    amount = 0
    if result is not None:
        amount = result.group(1)
    else:
        print("小区房屋总数解析错误: ")
    return amount


def getZonePrice(response, zoneID):
    result = re.search(r"plateId\s:\s\"([0-9]{5,20})\"", response)
    if result is not None:
        plateId = result.group(1)
        baseUrl = "http://sh.lianjia.com/xiaoqu/getStatics.json?propertyId="
        dataUrl = baseUrl + zoneID + "&plateId=" + plateId
        response = urllib2.urlopen(dataUrl)
        jsonData = json.loads(response.read())

        update = jsonData["updateMonth"]
        avgPrice = jsonData["propertyAvg"]
        monthAvgprice = jsonData["propertyAvgList"]
        monthList = jsonData["monthList"]
        ratioYear = "propertyAvgYear" in jsonData.keys() and jsonData[
            "propertyAvgYear"] or 0
        ratioMonth = "propertyAvgMonth" in jsonData.keys() and jsonData[
            "propertyAvgMonth"] or 0
        priceData = {
            "update": update,
            "avg_price": avgPrice,
            "avg_price_list": monthAvgprice,
            "month_list": monthList,
            "ratio_month": ratioMonth,
            "ratio_year": ratioYear
        }

    return priceData


if __name__ == '__main__':
    crawler()
