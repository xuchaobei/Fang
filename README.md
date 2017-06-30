## 项目简介

本项目是基于React、Node.js、MongoDB 实现的一个JS全栈项目，项目用于查询上海各小区的房价信息。

项目中使用BaiduMap 用于以地图模式浏览小区，使用Koa作为Web后台框架，项目的编译构建使用的是webpack。

各小区的房价信息通过爬虫从链家网上抓取，然后存取到MongoDB中。Node.js 和 Python实现了两种爬虫。

## 截图

![image](https://github.com/xuchaobei/fang/blob/master/fang.png)

## 安装及运行

1. 环境准备：Node.js、MongoDB、Python(可选)。
2. 进入项目根路径。
3. 执行 npm run build 安装项目依赖。 
4. 执行 npm run dev ， 启动项目。
5. 浏览器访问http://localhost:8080
6. 此时网页中是没有小区数据的，需要通过爬虫抓取小区房价信息。
   提供了两种爬虫实现：
   (1) 访问http://localhost:8080/crawler ， 触发Node.js实现的爬虫。注意，虽然这个接口会立即返回，但抓取数据的过程实际上是异步的，可以通过控制台的日志观察当前的数据抓取情况。
   (2) 在项目根路径下，执行python crawler.py ， 触发Python实现的爬虫。

**关于爬虫的注意事项**：链家网对于接口的调用是有频率和次数限制的，虽然在程序中加了延迟时间用来降低访问链家网接口的频率， 但实际测试下来，仍然无法抓取所有数据。想要抓取更多的数据，可增加程序的延迟时间，或者分多次抓取数据。

## 声明

爬虫抓取的数据来源于链家网，仅作为学习使用。

参考项目: https://github.com/vvsuperman/fkEstate 。

## License

MIT