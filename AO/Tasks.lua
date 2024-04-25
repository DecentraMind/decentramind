local json    = require("json")
local sqlite3 = require("lsqlite3")

DB            = DB or sqlite3.open_memory()

DB:exec [[
  CREATE TABLE IF NOT EXISTS tasks (
    "task_id" numeric(18,0) NOT NULL,
    "task_logo" varchar(1000) COLLATE "pg_catalog"."default" NOT NULL,
    "task_name" varchar(32) COLLATE "pg_catalog"."default" NOT NULL,
    "task_desc" varchar(255) COLLATE "pg_catalog"."default",
    "task_rule" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
    "task_reward" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
    "reward_total" numeric(30,8) NOT NULL,
    "time_zone" varchar(10) COLLATE "pg_catalog"."default" NOT NULL,
    "task_start_time" timestamp(6) NOT NULL,
    "task_end_time" timestamp(6) NOT NULL,
    "community_id" numeric(18,0) NOT NULL,
    "task_status" int4 NOT NULL,
    "task_status_name" varchar(30) COLLATE "pg_catalog"."default",
  );
]]

local function query(stmt)
    local rows = {}
    for row in stmt:nrows() do
        table.insert(rows, row)
    end
    stmt:reset()
    return rows
end

Handlers.add(
    "CreateTask",
    Handlers.utils.hasMatchingTag("Action", "CreateTask"),
    function(msg)
        local data = json.decode(msg.Data)

        local stmt = DB:prepare [[
      REPLACE INTO tasks (task_id, task_logo, task_name, task_desc, task_rule, task_reward, reward_total, time_zone, task_start_time, task_end_time, community_id, task_status, task_status_name)
      VALUES (:task_id, :task_logo, :task_name, :task_desc, :task_rule, :task_reward, :reward_total, :time_zone, :task_start_time, :task_end_time, :community_id, :task_status, :task_status_name)
    ]]

        if not stmt then
            error("Failed to prepare SQL statement: " .. DB:errmsg())
        end

        stmt:bind_names({
            task_id          = data.task_id,
            task_logo        = data.task_logo,
            task_name        = data.task_name,
            task_desc        = data.task_desc,
            task_rule        = data.task_rule,
            task_reward      = data.task_reward,
            reward_total     = data.reward_total,
            time_zone        = data.time_zone,
            task_start_time  = data.task_start_time,
            task_end_time    = data.task_end_time,
            community_id     = data.community_id,
            task_status      = data.task_status,
            task_status_name = data.task_status_name
        })

        stmt:step()
        stmt:reset()
        print('Create new task done!')
    end
)

Handlers.add(
  "GetAllTasks",
  Handlers.utils.hasMatchingTag("Action", "GetAllTasks"),
  function (msg)
    local stmt_all = [[
      SELECT t.*
      FROM tasks t
    ]]

    local stmt = DB:prepare(stmt_all)

    if not stmt then
      error("Failed to prepare SQL statement: " .. DB:errmsg())
    end

    local rows = query(stmt)
    Handlers.utils.reply(json.encode(rows))(msg)
  end
)