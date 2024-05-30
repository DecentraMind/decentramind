local json = require("json")
local ao = require('ao')
TasksForTable = TasksForTable or {}
SpaceTaskSubmittedTable = SpaceTaskSubmittedTable or {}
TaskJoidRecord = TaskJoidRecord or {}

Handlers.add(
    "CreateTask",
    Handlers.utils.hasMatchingTag("Action", "CreateTask"),
    function (msg)
        table.insert(TasksForTable, msg.Data)
        Handlers.utils.reply("created task by new method.")(msg)
    end
)

Handlers.add(
    "GetAllTasks",
    Handlers.utils.hasMatchingTag("Action", "GetAllTasks"),
    function (msg)
        local response = {}
      if next(TasksForTable) == nil then
        Handlers.utils.reply("null")(msg)
      end
        Handlers.utils.reply(table.concat(TasksForTable, ";"))(msg)
    end
)

Handlers.add(
    "DeleteLastTask",
    Handlers.utils.hasMatchingTag("Action", "DeleteLastTask"),
    function (msg)
        table.remove(TasksForTable)
        Handlers.utils.reply("The last task has been deleted.")(msg)
    end
)

Handlers.add(
    "JoinTask",
    Handlers.utils.hasMatchingTag("Action", "JoinTask"),
    function (msg)
        local req = json.decode(msg.Data)
        local taskId = req.taskId
        for key, value in pairs(TasksForTable) do
            local v = json.decode(value)
            if(v.taskId == taskId) then
                local tmp = v.joined
                tmp = tmp + 1
                v.joined = tmp
                print(tmp)
                TasksForTable[key] = json.encode(v)
                break
            end
        end
        -- 将参与任务信息保存在表中
        table.insert(TaskJoidRecord, msg.Data)
    end
)

Handlers.add(
    "getTaskJoinRecord",
    Handlers.utils.hasMatchingTag("Action", "getTaskJoinRecord"),
    function (msg)
        local taskId = msg.Tags.taskId
        local resp = {}
        for key, value in pairs(TaskJoidRecord) do
            local v = json.decode(value)
            if(v.taskId == taskId) then
                table.insert(resp, value)
            end
        end
        if next(resp) == nil then
          Handlers.utils.reply("null")(msg)
        end
          Handlers.utils.reply(table.concat(resp, ";"))(msg)
    end
)

Handlers.add(
    "SubmitSpaceTask",
    Handlers.utils.hasMatchingTag("Action", "SubmitSpaceTask"),
    function (msg)
        -- 将参与任务信息保存在表中
        table.insert(SpaceTaskSubmittedTable, msg.Data)
        Handlers.utils.reply("Joined in space task.")(msg)
    end
)

Handlers.add(
    "getSpaceTaskSubmitInfo",
    Handlers.utils.hasMatchingTag("Action", "getSpaceTaskSubmitInfo"),
    function (msg)
        local taskId = msg.Tags.taskId
        local resp = {}
        for key, value in pairs(SpaceTaskSubmittedTable) do
            local v = json.decode(value)
            if(v.taskId == taskId) then
                table.insert(resp, value)
            end
        end
        if next(resp) == nil then
          Handlers.utils.reply("null")(msg)
        end
          Handlers.utils.reply(table.concat(resp, ";"))(msg)
    end
)
--Handlers.add(
--    "GetJoinInfoByTaskId",
--    Handlers.utils.hasMatchingTag("Action", "GetJoinInfoByTaskId"),
--    function (msg)
--        -- 通过id获取该任务对应参与信息
--        local resp = {}
--        local taskId = msg.Data
--        for key, value in pairs(SpaceTaskSubmittedTable) do
--            local v = json.decode(value)
--            if(v.taskId == taskId) then
--                table.insert(resp, value)
--            end
--        end
--        Handlers.utils.reply(table.concat(resp, ";"))(msg)
--    end
--)

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

