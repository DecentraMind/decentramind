--用作创建Task时新建process的模板
local json = require("json")
local ao = require('ao')
Handlers.add(
    "sendBounty",
    Handlers.utils.hasMatchingTag("Action", "sendBounty"),
    function (msg)
        -- 通过id获取该任务对应参与信息
        local req = json.decode(msg.Data)
        local wallets = req.wallets
        local tokenNumber = req.tokenNumber
        local tokenType = req.tokenType
        for _, value in pairs(wallets) do
            ao.send({
              Target = tokenType,
              Action = "Transfer",
              Recipient = value,
              Quantity = tokenNumber
            })
        end
        Handlers.utils.reply("Send bounty success")(msg)
    end
)

Handlers.add(
    "sendBounty",
    Handlers.utils.hasMatchingTag("Action", "sendBounty"),
    function (msg)
        Handlers.utils.reply("Send bounty success")(msg)
    end
)
