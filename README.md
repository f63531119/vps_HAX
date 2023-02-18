
### 启动
1. 安装依赖：`npm install`
2. 启动脚本： `node index.js [备注]`，执行一次则启动一个telegram客户端
ps：备注一般填telegramID,也可不加，不加备注则默认把hax_code写入到redis的`hax_bot_code` key中。加备注，用于区分不同的telegram账号，因为你可能会用多个tg号撸hax或woiden，此时redis中的key为`hax_bot_code_备注`。


### 说明
1. 在 https://my.telegram.org/获取，点击API development tools （不知道为什么，我在电脑浏览器上生成不成功，手机浏览器上却成功了）。填到`index.js`的10、11行。
2. 如登陆验证成功，会打印出最近一次`hax_code`,请对比与你的app中是否一致。
3. 默认设置 hax_code轮询频率为1分钟，redis key过期时间为30分钟。
