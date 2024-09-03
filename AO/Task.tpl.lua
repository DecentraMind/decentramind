Variant = '0.3.2'
Name = 'DecentraMind Task-' .. Variant

--- This is a task process deployed from DecentraMind
local json = require("json")
local ao = require('.ao')

TaskOwnerWallet = ao.env.Process.Owner
TaskManagerProcess = TaskManagerProcess or "__TaskManagerProcess__"

---Reply with data
---@param data string|table
local function replyData(request, data)
  assert(type(data) == 'table' or type(data) == 'string', 'Invalid reply data type.')
  if type(data) == 'string' then
    request.reply({ Data = data })
  else
    request.reply({ Data = json.encode(data) })
  end
end

local function replyError(request, errorMsg)
  local action = (request.Tags and request.Tags.Action) or request.Action or "Unknow-Action"
  action = action .. "-Error"
  local errString = errorMsg
  if type(errorMsg) ~= "string" then
    errString = json.encode(errorMsg)
  end

  print('Reply ' .. action .. ' ' .. errString)
  request.reply({ Action = action, ["Message-Id"] = request.Id, Error = errString })
end

local function isTaskCreationSuccess()
  return Owner == nil
end

-- If task creaation process failed in the middle,
-- the task owner can invoke this action to get bounty tokens back.
Handlers.add(
  "SendBountyBackToTaskOwner",
  "SendBountyBackToTaskOwner",
  function(msg)
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
  "SetOwnerNil",
  function(msg)
    assert(msg.From == Owner, 'You are not the current Owner of this task process.')
    print('Set process owner to nil.')

    Owner = nil
  end
)

Handlers.add(
  "SendBounty",
  "SendBounty",
  function(msg)
    if (msg.From ~= TaskOwnerWallet) then
      return replyError(msg, "You are not the owner of this task.")
    end

    -- error if task not end
    local task = json.decode(Send({ Target = TaskManagerProcess, Action = 'GetTask', ProcessID = ao.id }).receive().Data)
    print('timestamp ' .. msg.Timestamp .. ' endTime ' .. task.endTime)
    if msg.Timestamp <= task.endTime then
      return replyError(msg, "The task has not ended yet.")
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
    replyData(msg, messages)
  end
)

Handlers.add(
  "GetOwner",
  "GetOwner",
  function(msg)
    Handlers.utils.reply(TaskOwnerWallet)(msg)
  end
)

Handlers.add(
  "GetVersion",
  "GetVersion",
  function(msg)
    Handlers.utils.reply(Variant)(msg)
  end
)
