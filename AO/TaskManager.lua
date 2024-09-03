Variant = '0.3.3'
Name = 'DecentraMindTaskManager-' .. Variant

local json = require("json")

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
--- @field taskName string

--- @type table<string, BountySend[]> Bounty send history, using task's process ID as key
BountySendHistory = BountySendHistory or {}

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

local function findIndex(array, predicate)
  for index, value in ipairs(array) do
    if predicate(value) then
      return index
    end
  end
  return nil -- If no element satisfies the predicate
end

Actions = {
  CreateTask = function(msg)
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

  DumpAll = function(msg)
    replyData(msg, {
      Tasks = json.encode(Tasks),
      TasksByCommunity = json.encode(TasksByCommunity),
      BountySendHistory = json.encode(BountySendHistory),
    })
  end,

  GetTask = function(msg)
    local pid = msg.Tags.ProcessID

    if not Tasks[pid] then
      return replyError(msg, 'Task not found.')
    end

    -- print('reply task: ' .. json.encode(Tasks[pid]))
    replyData(msg, Tasks[pid])
  end,

  GetTasksByCommunityUuid = function(msg)
    local cid = msg.Tags.CommunityUuid
    if not TasksByCommunity[cid] then
      replyData(msg, '[]')
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

  GetTasksByOwner = function(msg)
    local address = msg.Tags.Address
    local tasks = {}
    for _, task in pairs(Tasks) do
      if task.ownerAddress == address then
        table.insert(tasks, task)
      end
    end

    replyData(msg, tasks)
  end,

  JoinTask = function(msg)
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

  AddSubmission = function(msg)
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
    local find = findIndex(Tasks[pid].submissions, function(submit)
      return submit.address == msg.From
    end)
    if not find then
      Tasks[pid].submittersCount = Tasks[pid].submittersCount + 1
    end

    replyData(msg, tostring(submission.id))
  end,

  StoreBountySendHistory = function(msg)
    local pid = msg.Tags.TaskPid
    if not Tasks[pid] then
      return replyError(msg, 'Task not found.')
    end
    if Tasks[pid].ownerAddress ~= msg.From then
      return replyError(msg, 'You are not the owner of this task.')
    end

    assert(not Tasks[pid].isSettled, 'This task is already settled.')

    --- @type BountySend[]
    local histories = json.decode(msg.Data)
    if not BountySendHistory[pid] then
      BountySendHistory[pid] = {}
    end

    for _, history in pairs(histories) do
      table.insert(BountySendHistory[pid], history)
    end

    Tasks[pid].isSettled = true
  end,

  GetAllBounties = function(msg)
    local bounties = {}
    for _, bounty in pairs(BountySendHistory) do
      table.insert(bounties, bounty)
    end
    replyData(msg, bounties)
  end,

  GetBountiesByCommuintyID = function(msg)
    local uuid = msg.Tags.CommunityUuid

    if not TasksByCommunity[uuid] then
      return replyData(msg, '[]')
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

  GetBountiesByAddress = function(msg)
    local address = msg.Tags.Address
    local bounties = {
      published = {},
      awarded = {}
    }

    for _, taskBounties in pairs(BountySendHistory) do
      for _, bounty in pairs(taskBounties) do
        if not bounty.taskName then
          bounty.taskName = Tasks[bounty.taskPid].name
        end
        if bounty.sender == address then
          table.insert(bounties.published, bounty)
        end
        if bounty.recipient == address then
          table.insert(bounties.awarded, bounty)
        end
      end
    end
    replyData(msg, bounties)
  end,

  UpdateTaskScores = function(msg)
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
  end,

  -- TODO Update submission.calculatedBounties only, don't update the whole submissions
  UpdateTaskSubmissions = function(msg)
    local pid = msg.Tags.TaskPid

    if not Tasks[pid] then
      return replyError(msg, 'Task not found.')
    end

    if Tasks[pid].ownerAddress ~= msg.From then
      return replyError(msg, 'You are not the owner of this task.')
    end

    Tasks[pid].submissions = json.decode(msg.Data)
  end
}

for name, action in pairs(Actions) do
  Handlers.add(
    name,
    name,
    function(msg) action(msg) end
  )
end