## 简介

用React + BaiduMap + ECharts + Webpack + Koa ， 实现的上海各小区房价一览表。

Node.js 和 Python 两种方式实现数据抓取爬虫。

## 截图
![image](https://github.com/xuchaobei/fang/blob/master/fang.png)

## 安装及运行

1. 环境准备：Node.js、MongoDB、Python(可选)。
2. 进入项目根路径。
3. 执行 npm run build 安装项目依赖。 
4. 执行 npm run dev 或者 npm run start ， 启动项目。
5. 浏览器访问http://localhost:8080
6. 此时网页中是没有小区数据的，需要通过爬虫抓取小区房价信息。  </br>
   提供了两种爬虫实现：  </br>
   (1) 访问http://localhost:8080/crawler ， 触发Node.js实现的爬虫。  </br>
   (2) 在项目根路径下，执行python crawler.py ， 触发Python实现的爬虫。

## 声明

爬虫抓取的数据来源于链家网，仅作为学习使用。
参考项目: https://github.com/vvsuperman/fkEstate 。

## License

MIT
