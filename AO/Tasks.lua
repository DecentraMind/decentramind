local json = require("json")
TasksForTable = TasksForTable or {}
SpaceTaskJoinedTable = SpaceTaskJoinedTable or {}

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
    "JoinSpaceTask",
    Handlers.utils.hasMatchingTag("Action", "JoinSpaceTask"),
    function (msg)
        -- 解析传过来的参数，找到对应任务，修改任务已提交场次参数
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
        table.insert(SpaceTaskJoinedTable, msg.Data)
        Handlers.utils.reply("Joined in space task.")(msg)
    end
)

Handlers.add(
    "GetJoinInfoByTaskId",
    Handlers.utils.hasMatchingTag("Action", "GetJoinInfoByTaskId"),
    function (msg)
        -- 通过id获取该任务对应参与信息
        local resp = {}
        local taskId = msg.Data
        for key, value in pairs(SpaceTaskJoinedTable) do
            local v = json.decode(value)
            if(v.taskId == taskId) then
                table.insert(resp, value)
            end
        end
        Handlers.utils.reply(table.concat(resp, ";"))(msg)
    end
)
