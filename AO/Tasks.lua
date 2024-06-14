local json = require("json")
local ao = require('ao')
TasksForTable = TasksForTable or {}
SpaceTaskSubmittedTable = SpaceTaskSubmittedTable or {}
TaskJoidRecord = TaskJoidRecord or {}
XData = XData or {}

Handlers.add(
    "DeleteAll",
    Handlers.utils.hasMatchingTag("Action", "DeleteAll"),
    function (msg)
        TasksForTable = {}
        SpaceTaskSubmittedTable = {}
        TaskJoidRecord = {}
        Handlers.utils.reply("Delete TasksForTable SpaceTaskSubmittedTable and TaskJoidRecord success.")(msg)
    end
)

Handlers.add(
    "saveXData",
    Handlers.utils.hasMatchingTag("Action", "saveXData"),
    function (msg)
        table.insert(XData, msg.Data)
        Handlers.utils.reply("Data save success.")(msg)
    end
)

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
        local req = json.decode(msg.Data)
        local taskId = req.taskId
        if not SpaceTaskSubmittedTable[taskId] then
          -- 新建一个以 msg.Id 值为名字的列，并赋值为一个空表
          SpaceTaskSubmittedTable[taskId] = {}
        end
        local temp = SpaceTaskSubmittedTable[taskId]
        table.insert(temp, msg.Data)
        SpaceTaskSubmittedTable[taskId] = temp
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
          if(key == taskId) then
            resp = value
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
    "updateTaskAfterCal",
    Handlers.utils.hasMatchingTag("Action", "updateTaskAfterCal"),
    function (msg)
        -- 通过id获取该任务对应参与信息
        local taskId = msg.Data
        for i = 1, #TasksForTable do
            local v = json.decode(TasksForTable[i])
            if(v.taskId == taskId) then
                v.isCal = 'Y'
            end
            TasksForTable[i] = json.encode(v)
        end
        Handlers.utils.reply("update task success")(msg)
    end
)

Handlers.add(
    "updateTaskSubmitInfoAfterCal",
    Handlers.utils.hasMatchingTag("Action", "updateTaskSubmitInfoAfterCal"),
    function (msg)
        -- 通过id获取该任务对应参与信息
        local temp = {}
        local req = split(msg.Data, ';')
        for i = 1, #req do
        	table.insert(temp, req[i])
        end
        local taskId = msg.Tags.taskId
        for  key, value in pairs(SpaceTaskSubmittedTable) do
            if(key == taskId) then
            	SpaceTaskSubmittedTable[key] = temp
            end
        end
        Handlers.utils.reply("update task success")(msg)
    end
)

function split(input, delimiter)
    input = tostring(input)
    delimiter = tostring(delimiter)
    if (delimiter == "") then return false end
    local pos, arr = 0, {}
    for st, sp in function() return string.find(input, delimiter, pos, true) end do
        table.insert(arr, string.sub(input, pos, st - 1))
        pos = sp + 1
    end
    table.insert(arr, string.sub(input, pos))
    return arr
end
TaskOwnerWallet = "xxx"
Handlers.add(
    "sendBounty",
    Handlers.utils.hasMatchingTag("Action", "sendBounty"),
    function (msg)
        if(msg.From ~= TaskOwnerWallet) then
        	Handlers.utils.reply("notMatch")(msg)
        end
        -- 通过id获取该任务对应参与信息
        local req = json.decode(msg.Data)
        for _, value in pairs(req) do
            ao.send({
              Target = value.tokenType,
              Action = "Transfer",
              Recipient = value.walletAddress,
              Quantity = tostring(value.tokenNumber)
            })
        end
        for _, value in pairs(req) do
            ao.send({
              Target = value.tokenType1,
              Action = "Transfer",
              Recipient = value.walletAddress,
              Quantity = tostring(value.tokenNumber1)
            })
        end
        Handlers.utils.reply("success")(msg)
    end
)
Handlers.add(
    "testSend",
    Handlers.utils.hasMatchingTag("Action", "testSend"),
    function (msg)
        local req = json.decode(msg.Data)
        local tokenType = "x"
        local receipt = "x"
        local tokenNumber = "x"
        --print(req[0].tokenType)
        for _, value in pairs(req) do
            tokenType = value.tokenType
            receipt = value.walletAddress
            tokenNumber = value.tokenNumber
            print(tokenType)
            print(receipt)
            print(tokenNumber)
            ao.send({
            Target = tokenType,
            Action = "Transfer",
            Recipient = receipt,
            Quantity = tostring(tokenNumber)
            })
        end

        --local tokenType = "Z-ZCfNLmkEdBrJpW44xNRVoFhEEOY4tmSrmLLd5L_8I"
        --local receipt = "bOTVb61Rq91cVesuxZ_0fBk4Ii-GNsEbT3Iu5KD3HWg"
        --local tokenNumber = 1000.1

        Handlers.utils.reply("success")(msg)
    end
)
Handlers.add(
    "getMsgFrom",
    Handlers.utils.hasMatchingTag("Action", "getMsgFrom"),
    function (msg)
        Handlers.utils.reply(msg.From)(msg)
    end
)

