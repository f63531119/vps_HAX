
### 启动
1. 安装依赖：`npm install`；推荐nodejs版本为v16.x及以上
2. 修改`index.js`中第82行的redis配置，应与`extend_vps_playwright`项目中的redis连接配置一致，https://app.redislabs.com/ 可以免费领取30M内存的redis。
3. 启动脚本： `node index.js [备注]`，执行一次则启动一个telegram客户端
ps：备注一般填telegramID,也可不加，不加备注则默认把hax_code写入到redis的`hax_bot_code` key中。加备注，用于区分不同的telegram账号，因为你可能会用多个tg号撸hax或woiden，此时redis中的key为`hax_bot_code_备注`。


### 说明
1. 在 https://my.telegram.org/获取， 点击API development tools （不知道为什么，我在电脑浏览器上生成不成功，手机浏览器上却成功了，莫非是浏览器UA bug）。填到`index.js`的11、12行。
2. 如登陆验证成功并且你的hax_bot消息记录中最近一条消息是续签code，则会打印出该code，请对比与你的app中是否一致。
3. 默认设置 hax_code轮询频率为8秒，redis key过期时间为30分钟。

### 补充
1. 建议用pm2守护该进程。
2. 实测发现，长期运行下来，会存在内存回收不及时的情况，导致内存持续积压，没精力解决了，建议写个crontab，5~6小时重启一次，`pm2 restart index.js`或者`pm2 reload index,js`。
