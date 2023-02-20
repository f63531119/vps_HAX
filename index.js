//telegram 客户端文档： https://gram.js.org/
import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import input from "input";
import { createClient } from "redis";
import fs from "fs";

/*
 *  以下信息在 https://my.telegram.org/获取，点击API development tools （不知道为什么，我在电脑浏览器上生成不成功，手机浏览器上却成功了）
 */
const apiId = 27630163;
const apiHash = "02dbcd7dff4a51bbc0566788458f0e69";
let session_auth_key = "";

try {
  session_auth_key = fs.readFileSync("session_auth.key", "utf8");
  //console.log("telegram session_auth_key = ", session_auth_key);
} catch (err) {
  console.error("读取session_auth_key出现异常:", err);
}

const stringSession = new StringSession(session_auth_key);

(async () => {
  console.log("Loading interactive example...");
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });
  await client.start({
    phoneNumber: async () =>
      await input.text("请输入手机号--格式: +{区号}{手机号}:  "),
    password: async () => await input.text("请输入两步验证密码:  "),
    phoneCode: async () =>
      await input.text("请输入Telegram官方频道发来的登陆码:  "),
    onError: (err) => console.log(err),
  });
  console.log("You should now be connected.");
  let session_auth_key_now = client.session.save();
  console.log(session_auth_key_now);

  if (session_auth_key == "") {
    fs.writeFile("session_auth.key", session_auth_key_now, (err) => {
      if (err) {
        console.log("向session_auth.key文件写入telegram session出现异常:", err);
        throw err;
      } else console.log("向session_auth.key文件写入telegram session成功!");
    });
  }

  // await client.sendMessage("me", { message: "Hello!" });
  let formal_code = "";
  let now_code = "";
  let haxbot_senderId = "1967189265";
  let hax_bot_code_redis_key = "hax_bot_code";
  const cmd_arg = process.argv[2];
  if (cmd_arg != undefined)
    hax_bot_code_redis_key = hax_bot_code_redis_key + "_" + cmd_arg;

  setInterval(async function () {
    const result = await client.invoke(
      new Api.messages.GetDialogs({
        offsetPeer: "username",
        limit: 100,
        hash: BigInt("-4156887774564"),
        excludePinned: false,
        folderId: 0,
      })
    );
    //result.messages[].message  过滤出_senderID=1967189265 || message_id= 32;   我的电报机器人mrzyangBot的_senderId=6035543560
    let message_arr = result.messages;
    for (const messageObj of message_arr) {
      if (
        messageObj.senderId == haxbot_senderId &&
        messageObj.message.includes("Your Code is")
      ) {
        // 判断为hax_bot的消息,并且包含"Your Code is"字符串
        now_code = messageObj.message.substring(14);
        if (now_code != formal_code) {
          // 前后两次code不一致，向redis里写一个String--key为 hax_bot_code[_命令行第一个参数]，过期时间设置为30分钟=1800秒
          const client = createClient({
            //url: "redis://eeeoa.com:8899", //这里可以改为自己的redis地址
            url: "redis://username:password@redisserver.example.com:6379",
          });
          client.on("error", (err) =>
            console.log("Redis客户端初始化失败:", err)
          );
          await client.connect();
          await client.set(hax_bot_code_redis_key, now_code, {
            EX: 30 * 60, // expire 单位秒
          }); //过期时间设为30分钟
          const code_from_redis = await client.get(hax_bot_code_redis_key);
          console.log("code_from_redis = " + code_from_redis);
          await client.disconnect();
          //redis写完之后
          formal_code = now_code;
        }
      }
    }
  }, 8 * 1000); //轮询hax_bot的消息，频率为8秒
})();
