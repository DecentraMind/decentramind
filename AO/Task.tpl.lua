Name = 'DecentraMind Task'
Variant = '0.1.0'

--- This is a task process deployed from DecentraMind
local json = require("json")

TaskOwnerWallet = ao.env.Process.Owner

local function replyError(request, errorMsg)
  local action = request.Action .. "-Error"
  local errString = errorMsg
  if type(errorMsg) ~= "string" then
    errString = json.encode(errorMsg)
  end

  ao.send({Target = request.From, Action = action, ["Message-Id"] = request.Id, Error = errString})
end

Handlers.add(
  "SendBounty",
  Handlers.utils.hasMatchingTag("Action", "SendBounty"),
  function (msg)
    if (msg.From ~= TaskOwnerWallet) then
      return replyError(msg, "You are not the owner of this task.")
    end

    local bounties = json.decode(msg.Data)
    local messages = {}
    for _, bounty in pairs(bounties) do
      local message = ao.send({
        Target = bounty.tokenProcessID,
        Action = "Transfer",
        Recipient = bounty.recipient,
        Quantity = tostring(bounty.quantity)
      })
      table.insert(messages, message)
    end
    Handlers.utils.reply(json.encode(messages))(msg)
  end
)

Handlers.add(
  "GetOwner",
  Handlers.utils.hasMatchingTag("Action", "GetOwner"),
  function (msg)
    Handlers.utils.reply(TaskOwnerWallet)(msg)
  end
)


Handlers.add(
  "GetVersion",
  Handlers.utils.hasMatchingTag("Action", "GetVersion"),
  function (msg)
    Handlers.utils.reply(Variant)(msg)
  end
)
