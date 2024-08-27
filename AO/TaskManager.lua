Name = 'DecentraMind Task Manager'
Variant = '0.2.9'

local json = require("json")
local ao = require('ao')

--- @class Task
--- @field processID string @process ID as unique primary key
--- @field type string @The type of task, valid type: 'space'
--- @field visible string @Visibility of the task, either 'public' or 'private'
--- @field communityUuid string @UUID of the associated community
--- @field name string @Name of the task
--- @field intro string @Introduction or description of the task
--- @field rule string @Rules associated with the task
--- @field banner string @Banner image URL for the task
--- @field totalChances number @Total number of chances available for the task
--- @field timezone string @Timezone in which the task operates
--- @field startTime number @Start time of the task (timestamp)
--- @field endTime number @End time of the task (timestamp)
--- @field createTime number @Creation time of the task (timestamp)
--- @field ownerAddress string @Owner's address (likely a wallet address)
--- @field submittersCount number @Number of submitters for the task
--- @field isScoreCalculated boolean @Whether the score has been calculated
--- @field isSettled boolean @Whether the task has been settled
--- @field bounties TaskBounty[] @List of bounties associated with the task
--- @field builders table<string, TaskBuilder> @Table of builders associated with the task, index by builder's address
--- @field submissions Submission[] @List of submission

--- @class TaskBounty
--- @field amount number @Human readable amount of the bounty
--- @field quantity string bigint string of bounty quantity
--- @field tokenName string @Name of the token
--- @field tokenProcessID string @Process ID of the token
--- @field chain string @Name of the blockchain

--- @class TaskBuilder
--- @field address string @Builder's address (likely a wallet address)
--- @field inviterAddress string|nil @Address of the inviter (optional)

--- @class Submission
--- @field id number
--- @field address string submitter's address
--- @field taskPid string task process ID
--- @field score number
--- @field createTime number
--- @field brandEffect number|nil
--- @field inviteCount number|nil
--- @field audience number|nil
--- @field url string|nil

--- @type table<string, Task> @Tasks table using task's processID as key
Tasks = Tasks or {}
--- @type table<string, string[]> @Tasks process ID table using community's uuid as key
TasksByCommunity = TasksByCommunity or {}

--- @class Scores
--- @field id number
--- @field score number

--- @class BountySend
--- @field taskPid string
--- @field sender string
--- @field recipient string
--- @field tokenProcessID string
--- @field amount number
--- @field quantity string BitInt string of bounty quantity. Human readable amount = quantity / Math.pow(10, token.denomination)
--- @field tokenName string
--- @field comunityUuid string
--- @field communityName string

--- @type table<string, BountySend[]> Bounty send history, using task's process ID as key
BountySendHistory = BountySendHistory or {}

local function replyError(request, errorMsg)
  local action = (request.Tags and request.Tags.Action) or request.Action or "Unknow-Action"
  action = action .. "-Error"
  local errString = errorMsg
  if type(errorMsg) ~= "string" then
    errString = json.encode(errorMsg)
  end

  ao.send({Target = request.From, Action = action, ["Message-Id"] = request.Id, Error = errString})
end

---Reply with data
---@param data string|table
local function replyData(request, data)
  assert(type(data) == 'table' or type(data) == 'string', 'Invalid reply data type.')
  if type(data) == 'string' then
    ao.send({ Target = request.From, Data = data })
  else
    ao.send({ Target = request.From, Data = json.encode(data) })
  end
end

local function findIndex(array, predicate)
  for index, value in ipairs(array) do
      if predicate(value) then
          return index
      end
  end
  return nil  -- If no element satisfies the predicate
end

TaskManager = {
  create = function (msg)
    --- @type Task
    local task = json.decode(msg.Data)
    local cid = task.communityUuid
    local pid = task.processID

    if Tasks[pid] then
      return replyError(msg, 'Task existed.')
    end

    -- TODO validate task fields
    Tasks[pid] = task
    Tasks[pid].createTime = msg.Timestamp
    Tasks[pid].ownerAddress = msg.From
    Tasks[pid].submittersCount = 0
    Tasks[pid].isScoreCalculated = false
    Tasks[pid].isSettled = false
    Tasks[pid].builders = {}
    Tasks[pid].submissions = {}

    if not TasksByCommunity[cid] then
      TasksByCommunity[cid] = {}
    end
    table.insert(TasksByCommunity[cid], pid)

    replyData(msg, Tasks[pid])
  end,

  dumpAll = function (msg)
    replyData(msg, {
      Tasks = Dump(Tasks, 0),
      TasksByCommunity = Dump(TasksByCommunity, 0),
      BountySendHistory = Dump(BountySendHistory, 0)
    })
  end,

  getTask = function (msg)
    local pid = msg.Tags.ProcessID

    if not Tasks[pid] then
      return replyError(msg, 'Task not found.')
    end

    replyData(msg, Tasks[pid])
  end,

  getTasksByCommunityUuid = function (msg)
    local cid = msg.Tags.CommunityUuid
    if not TasksByCommunity[cid] then
      Handlers.utils.reply(json.encode({}))(msg)
      return
    end

    local tasks = {}
    for _, pid in pairs(TasksByCommunity[cid]) do
      if Tasks[pid] then
        table.insert(tasks, Tasks[pid])
      end
    end

    replyData(msg, tasks)
  end,

  joinTask = function(msg)
    local pid = msg.Tags.TaskPid
    if not Tasks[pid] then
      return replyError(msg, 'Task not found.')
    end

    assert(Tasks[pid].endTime > msg.Timestamp, 'The task has already ended.')

    if Tasks[pid].builders[msg.From] then
      return replyError(msg, 'You have joined this task.')
    end

    local builder = {
      address = msg.From
    }
    if (msg.Tags.InviterAddress) then
      builder.inviterAddress = msg.Tags.InviterAddress
    end
    Tasks[pid].builders[msg.From] = builder
  end,

  addSubmission = function(msg)
    -- TOOD validate msg.Data
    --- @type Submission
    local submission = json.decode(msg.Data)
    local pid = submission.taskPid

    if not Tasks[pid] then
      return replyError(msg, 'Task not found.')
    end

    assert(Tasks[pid].endTime > msg.Timestamp, 'The task has already ended.')

    --- TODO if not Tasks[pid].builders[msg.From] then Tasks[pid].builders[msg.From] = builder end
    submission.id = #Tasks[pid].submissions + 1
    submission.score = 0
    submission.createTime = msg.Timestamp
    --- if task.type == 'space'
    --- submission.brandEffect = 0
    --- submission.inviteCount = 0
    --- submission.audience = 0

    table.insert(Tasks[pid].submissions, submission)

    --- update Tasks[pid].submittersCount
    --- if submission.address is not seen in Tasks[pid].submissions, add it
    if not findIndex(Tasks[pid].submissions, function (submit)
      return submit.address == msg.From
    end) then
      Tasks[pid].submittersCount = Tasks[pid].submittersCount + 1
    end

    Handlers.utils.reply(tostring(submission.id))(msg)
  end,


  storeBountySendHistory = function (msg)
    local pid = msg.Tags.TaskPid
    if not Tasks[pid] then
      return replyError(msg, 'Task not found.')
    end
    if Tasks[pid].ownerAddress ~= msg.From then
      return replyError(msg, 'You are not the owner of this task.')
    end

    --- @type BountySend
    local history = json.decode(msg.Data)
    if not BountySendHistory[pid] then
      BountySendHistory[pid] = {}
    end
    table.insert(BountySendHistory[pid], history)
  end,

  getAllBounties = function(msg)
    replyData(msg, BountySendHistory)
  end,

  getBountiesByCommuintyID = function (msg)
    local uuid = msg.Tags.CommunityUuid

    if not TasksByCommunity[uuid] then
      return Handlers.utils.reply('[]')(msg)
    end

    local result = {}
    for _, taskPid in pairs(TasksByCommunity[uuid]) do
      if BountySendHistory[taskPid] then
        for _, bounty in pairs(BountySendHistory[taskPid]) do
          table.insert(result, bounty)
        end
      end
    end

    replyData(msg, result)
  end,

  updateTaskScores = function (msg)
    local pid = msg.Tags.TaskPid

    if not Tasks[pid] then
      return replyError(msg, 'Task not found.')
    end

    if Tasks[pid].ownerAddress ~= msg.From then
      return replyError(msg, 'You are not the owner of this task.')
    end

    assert(not Tasks[pid].isSettled, 'The task is already settled.')

    --- @type table<number, Scores>
    local scores = json.decode(msg.Data)
    for _, score in pairs(scores) do
      local submission = Tasks[pid].submissions[score.id]
      submission.score = score.score
    end

    Tasks[pid].isScoreCalculated = true
  end
}

Handlers.add(
  "CreateTask",
  Handlers.utils.hasMatchingTag("Action", "CreateTask"),
  TaskManager.create
)

-- Handlers.add(
--   "GetAll",
--   Handlers.utils.hasMatchingTag("Action", "GetAll"),
--   TaskManager.getAll
-- )

Handlers.add(
  "GetTask",
  Handlers.utils.hasMatchingTag("Action", "GetTask"),
  TaskManager.getTask
)

Handlers.add(
  "DumpAll",
  Handlers.utils.hasMatchingTag("Action", "DumpAll"),
  TaskManager.dumpAll
)

Handlers.add(
  'GetTasksByCommunityUuid',
  Handlers.utils.hasMatchingTag('Action', 'GetTasksByCommunityUuid'),
  TaskManager.getTasksByCommunityUuid
)

Handlers.add(
  "JoinTask",
  Handlers.utils.hasMatchingTag("Action", "JoinTask"),
  TaskManager.joinTask
)

Handlers.add(
  "AddSubmission",
  Handlers.utils.hasMatchingTag("Action", "AddSubmission"),
  TaskManager.addSubmission
)

Handlers.add(
  "UpdateTaskScores",
  Handlers.utils.hasMatchingTag("Action", "UpdateTaskScores"),
  TaskManager.updateTaskScores
)

Handlers.add(
  "SetTaskIsSettled",
  Handlers.utils.hasMatchingTag("Action", "SetTaskIsSettled"),
  function (msg)
    local pid = msg.Tags.TaskPid

    if not Tasks[pid] then
      return replyError(msg, 'Task not found.')
    end

    if Tasks[pid].ownerAddress ~= msg.From then
      return replyError(msg, 'You are not the owner of this task.')
    end

    Tasks[pid].isSettled = true
  end
)

Handlers.add(
  "UpdateTaskSubmissions",
  Handlers.utils.hasMatchingTag("Action", "UpdateTaskSubmissions"),
  function (msg)
    local pid = msg.Tags.TaskPid

    if not Tasks[pid] then
      return replyError(msg, 'Task not found.')
    end

    if Tasks[pid].ownerAddress ~= msg.From then
      return replyError(msg, 'You are not the owner of this task.')
    end

    Tasks[pid].submissions = json.decode(msg.Data)
  end
)

Handlers.add(
  "StoreBountySendHistory",
  Handlers.utils.hasMatchingTag("Action", "StoreBountySendHistory"),
  TaskManager.storeBountySendHistory
)

Handlers.add(
  "GetAllBounties",
  Handlers.utils.hasMatchingTag("Action", "GetAllBounties"),
  TaskManager.getAllBounties
)


Handlers.add(
  "GetBountiesByCommunityID",
  Handlers.utils.hasMatchingTag("Action", "GetBountiesByCommunityID"),
  TaskManager.getBountiesByCommuintyID
)
