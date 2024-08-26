Name = 'DecentraMind Task'
Variant = '0.2.2'

--- This is a task process deployed from DecentraMind
local json = require("json")

TaskOwnerWallet = ao.env.Process.Owner
TaskManagerProcess = "__TaskManagerProcess__"

local function replyError(request, errorMsg)
  local action = (request.Tags and request.Tags.Action) or request.Action or "Unknow-Action"
  action = action .. "-Error"
  local errString = errorMsg
  if type(errorMsg) ~= "string" then
    errString = json.encode(errorMsg)
  end

  ao.send({Target = request.From, Action = action, ["Message-Id"] = request.Id, Error = errString})
end

local function isTaskCreationSuccess()
  return Owner == nil
end

-- If task creaation process failed in the middle,
-- the task owner can invoke this action to get bounty tokens back.
Handlers.add(
  "SendBountyBackToTaskOwner",
  Handlers.utils.hasMatchingTag("Action", "SendBountyBackToTaskOwner"),
  function (msg)
    if (msg.From ~= TaskOwnerWallet) then
      return replyError(msg, "You are not the owner of this task.")
    end
    assert(isTaskCreationSuccess() == false, 'You can not invoke this action after task process received all bounties.')

    local message = ao.send({
      Target = msg.Tags.TokenProcessID,
      Action = "Transfer",
      Recipient = msg.From,
      Quantity = tostring(msg.Tags.Quantity)
    })

    Handlers.utils.reply(json.encode(message))(msg)
  end
)

-- Invoke this action if all bounty tokens are transfered to this task process,
-- and all task creation steps are finished successfully.
Handlers.add(
  "SetOwnerNil",
  Handlers.utils.hasMatchingTag("Action", "SetOwnerNil"),
  function (msg)
    assert(msg.From == Owner, 'You are not the current Owner of this task process.')
    print('Set process owner to nil.')

    Owner = nil
  end
)

Handlers.add(
  "SendBounty",
  Handlers.utils.hasMatchingTag("Action", "SendBounty"),
  function (msg)
    if (msg.From ~= TaskOwnerWallet) then
      return replyError(msg, "You are not the owner of this task.")
    end

    ---TODO error if task not end
    -- task = ao.send()
    -- if (msg.Timestamp <= task.endTime) then
    --   return replyError(msg, "The task has not ended yet.")
    -- end

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