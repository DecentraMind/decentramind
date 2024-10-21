Variant = '0.4.56'
Name = 'DecentraMind-' .. Variant

local json = require("json")
local u = require("u")
VouchProcessId = 'ZTTO02BL2P-lseTLUgiIPD9d0CF1sc4LbMA2AQ7e9jo'

---@class Community
---@field uuid string
---@field logo string arweave hash of logo
---@field bounty string[] bounty token names
---@field communitychatid string process ID of chatroom
---@field banner string banner name or arwaeve hash of banner
---@field support
---@field creator string
---@field owner string
---@field timestamp number
---@field communitytoken
---@field tokensupply
---@field buildnum number
---@field ispublished boolean
---@field name string
---@field desc string introduction
---@field admins string[]

--- @type table<string, Community> Communities indexed by community's uuid
Communities = Communities or {}

---@class User
---@field name string
---@field avatar string

---@type table<string, User>
Users = Users or {}

--- @type table<string, string[]> table of community's muted user addresses
MutedUsers = MutedUsers or {}

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
--- @field inviteCode string|nil
--- @field link string|nil @Twitter link for promotion task, required for promotion task

--- @class TaskBounty
--- @field amount number @Human readable amount of the bounty
--- @field quantity string bigint string of bounty quantity
--- @field tokenName string @Name of the token
--- @field tokenProcessID string @Process ID of the token
--- @field chain string @Name of the blockchain

--- @class TaskBuilder
--- @field address string @Builder's address (likely a wallet address)
--- @field inviterAddress string|nil @Address of the inviter (optional)
--- @field joinTime number @Timestamp when the builder joined the task

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

---@class Invite
---@field type string 'task' | 'community'
---@field taskPid string | nil
---@field communityUuid string
---@field inviterAddress string
---@field invitees table<string, {joinTime: number}>

---@type table<string, Invite> Invites by invite codes
Invites = Invites or {}
---@type table<string, table<string, string>> Invite codes by inviter address and task pid. This index is used for quick lookup by inviter address and task pid.
InviteCodesByInviterByTaskPid = InviteCodesByInviterByTaskPid or {}
---@type table<string, table<string, string>> Invite codes by inviter address and community uuid. This index is used for quick lookup by inviter address and community uuid.
InviteCodesByInviterByCommunityUuid = InviteCodesByInviterByCommunityUuid or {}

---@class UserCommunity
---@field joinTime number
---@field inviteCode string|nil if the invitee is not invited by others, the inviteCode is nil

---@type table<string, table<string, UserCommunity>> This is user-communities relation. Invite Codes by invitee address and community uuid. This index is used for querying user's joined communities.
UserCommunities = UserCommunities or {}


---@param type string 'task' | 'community'
---@param address string
---@param pidOrCommunityUuid string
---@return string
local function createInviteCode(type, address, pidOrCommunityUuid)
  assert(type == 'task' or type == 'community', 'Invalid invite code type: ' .. type)
  assert(pidOrCommunityUuid, 'Task pid or community uuid is required.')

  local code = u.uid()
  ---@type Invite
  local invite

  if type == 'task' then
    assert(Tasks[pidOrCommunityUuid], 'Task not found.')

    if not InviteCodesByInviterByTaskPid[address] then
      InviteCodesByInviterByTaskPid[address] = {}
    end
    if InviteCodesByInviterByTaskPid[address][pidOrCommunityUuid] then
      return InviteCodesByInviterByTaskPid[address][pidOrCommunityUuid]
    end

    invite = {
      type = type,
      inviterAddress = address,
      taskPid = pidOrCommunityUuid,
      communityUuid = Tasks[pidOrCommunityUuid].communityUuid,
      invitees = {}
    }

    InviteCodesByInviterByTaskPid[address][pidOrCommunityUuid] = code

  elseif type == 'community' then
    assert(Communities[pidOrCommunityUuid], 'Community not found.')

    if not InviteCodesByInviterByCommunityUuid[address] then
      InviteCodesByInviterByCommunityUuid[address] = {}
    end
    if InviteCodesByInviterByCommunityUuid[address][pidOrCommunityUuid] then
      return InviteCodesByInviterByCommunityUuid[address][pidOrCommunityUuid]
    end

    invite = {
      type = type,
      communityUuid = pidOrCommunityUuid,
      inviterAddress = address,
      invitees = {}
    }

    InviteCodesByInviterByCommunityUuid[address][pidOrCommunityUuid] = code
  end

  Invites[code] = invite

  return code
end

Actions = {
  Community = {
    CreateCommunity = function(msg)
      local community = json.decode(msg.Data)
      local address = msg.From
      -- Check if a column with the same name already exists
      if not Users[address] then
        -- Create a new column with the msg.Id value as its name and assign it to an empty table
        Users[address] = {}
      end

      local uuid = u.createUuid()

      if Communities[uuid] then
        return u.replyError(msg, 'uuid existed.')
      end

      Communities[uuid] = community
      Communities[uuid].uuid = uuid
      Communities[uuid].creator = address
      Communities[uuid].timestamp = msg.Timestamp
      Communities[uuid].buildnum = 1
      Communities[uuid].admins = {}

      if not UserCommunities[address] then
        UserCommunities[address] = {}
      end
      UserCommunities[address][uuid] = { joinTime = msg.Timestamp }

      local copy = u.deepCopy(Communities[uuid])
      copy.isJoined = true
      copy.joinTime = msg.Timestamp
      u.replyData(msg, json.encode(copy))
    end,

    GetCommunities = function(msg)
      local communities = {}

      for uuid, community in pairs(Communities) do
        local copy = u.deepCopy(community)
        copy.isJoined = false

        local address = msg.Tags.userAddress
        if address and UserCommunities[address] and UserCommunities[address][uuid] then
          copy.isJoined = true
          copy.joinTime = UserCommunities[address][uuid].joinTime

          if InviteCodesByInviterByCommunityUuid[address] and InviteCodesByInviterByCommunityUuid[address][uuid] then
            copy.inviteCode = InviteCodesByInviterByCommunityUuid[address][uuid]
          end
        end
        table.insert(communities, copy)
      end

      u.replyData(msg, communities)
    end,

    GetCommunity = function(msg)
      local community = u.deepCopy(Communities[msg.Tags.Uuid])
      local uuid = msg.Tags.Uuid
      if not community then
        return u.replyError(msg, "Not found.")
      end

      local copy = u.deepCopy(community)
      copy.isJoined = false

      local address = msg.Tags.userAddress
      if address and UserCommunities[address] and UserCommunities[address][uuid] then
        copy.isJoined = true
        copy.joinTime = UserCommunities[address][uuid].joinTime

        if InviteCodesByInviterByCommunityUuid[address] and InviteCodesByInviterByCommunityUuid[address][uuid] then
          copy.inviteCode = InviteCodesByInviterByCommunityUuid[address][uuid]
        end
      end

      u.replyData(msg, copy)
    end,

    -- TODO only update specific field, don't replace the whole Communities[uuid]
    -- TODO only whitelisted field can be updated here. uuid/buildNum cannot updated by this Action.
    UpdateCommunity = function(msg)
      local setting = json.decode(msg.Data)

      if not setting.uuid then
        return u.replyError(msg, 'uuid is required.')
      end

      local community = Communities[setting.uuid]
      if not community then
        return u.replyError(msg, 'community not found.')
      end
      if msg.From ~= community.owner then
        return u.replyError(msg, 'You are not the owner')
      end

      for field, value in pairs(setting) do
        community[field] = value
      end

      local copy = u.deepCopy(community)
      copy.isJoined = false
      local address = msg.From
      if UserCommunities[address] and UserCommunities[address][setting.uuid] then
        copy.isJoined = true
        copy.joinTime = UserCommunities[address][setting.uuid].joinTime
      end
      u.replyData(msg, json.encode(copy))
    end,

    UpdateCommunityAdmins = function(msg)
      ---@type string[]
      local admins = json.decode(msg.Data)
      local uuid = msg.Tags.Uuid

      local community = Communities[uuid]
      if not community then
        return u.replyError(msg, 'Community not found.')
      end

      if msg.From ~= community.owner then
        return u.replyError(msg, 'You are not the owner.')
      end

      community.admins = admins

      u.replyData(msg, community.admins)
    end,

    Join = function(msg)
      local address = msg.From
      local uuid = msg.Tags.CommunityUuid
      local inviteCode = msg.Tags.InviteCode

      --- TODO check vouch data
      --- FIXME user will not be able to join community if check vouch data here
      -- local isVouched = u.isVouch(address)
      -- if not isVouched then
      --   return u.replyError(msg, 'No vouch data of ' .. address .. '.')
      -- end

      local community = Communities[uuid]
      assert(community, 'Community not found.')

      --- if user has already joined the community, return
      if UserCommunities[address] and UserCommunities[address][uuid] then
        return
      end

      if community then
        if community.buildnum then
          community.buildnum = community.buildnum + 1
        else
          community.buildnum = 1
        end
      end

      if not UserCommunities[address] then
        UserCommunities[address] = {}
      end

      if not UserCommunities[address][uuid] then
        -- TOOD use msg.Timstamp
        UserCommunities[address][uuid] = { joinTime = msg.Timestamp }
      end

      local userCommunity = { joinTime = msg.Timestamp }
      if inviteCode then
        if Invites[inviteCode] then
          Invites[inviteCode].invitees[address] = { joinTime = msg.Timestamp }
          userCommunity.inviteCode = inviteCode
        end
      end

      -- no valid invite code, save user-community relation
      if not UserCommunities[address] then
        UserCommunities[address] = {}
      end
      UserCommunities[address][uuid] = userCommunity

      createInviteCode('community', address, uuid)
      u.replyData(msg, uuid)
    end,

    Exit = function(msg)
      local address = msg.From
      local uuid = msg.Tags.Uuid

      local community = Communities[uuid]
      if not community then
        return u.replyError(msg, 'Community not found.')
      end

      if community.owner == address then
        return u.replyError(msg, 'You can not exit since you are the owner.')
      end

      if community.buildnum then
        community.buildnum = math.max(0, community.buildnum - 1)
      end
      if not UserCommunities[address] or not UserCommunities[address][uuid] then
        return u.replyError(msg, "Not found related user-community info in UserCommunities[" .. address .. "]")
      end

      --- delete related invitee of invite code
      if UserCommunities[address][uuid].inviteCode then
        ---@type Invite
        local invite = Invites[UserCommunities[address][uuid].inviteCode]
        if invite then
          invite.invitees[address] = nil
        end
      end

      UserCommunities[address][uuid] = nil
    end,
  },

  Tasks = {
    CreateTask = function(msg)
      --- @type Task
      local task = json.decode(msg.Data)
      local cid = task.communityUuid
      local pid = task.processID

      if Tasks[pid] then
        return u.replyError(msg, 'Task existed.')
      end

      -- only allow owner or admins to create task
      local community = Communities[cid]
      if not community then
        return u.replyError(msg, 'Community not found.')
      end

      local isPermitted = msg.From == community.owner
      if not isPermitted then
        for _, admin in pairs(community.admins) do
          if admin == msg.From then
            isPermitted = true
            break
          end
        end
      end

      if not isPermitted then
        return u.replyError(msg, 'Only owner or admins can create task.')
      end

      if task.type == 'promotion' and not task.link then
        return u.replyError(msg, 'Link cannot be empty.')
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

      u.replyData(msg, Tasks[pid])
    end,

    DumpAll = function(msg)
      u.replyData(msg, {
        Tasks = json.encode(Tasks),
        TasksByCommunity = json.encode(TasksByCommunity),
        BountySendHistory = json.encode(BountySendHistory),
      })
    end,

    GetTask = function(msg)
      local pid = msg.Tags.ProcessID

      if not Tasks[pid] then
        return u.replyError(msg, 'Task not found.')
      end
      local copy = u.deepCopy(Tasks[pid])

      local address = msg.From
      if address and InviteCodesByInviterByTaskPid[address] and InviteCodesByInviterByTaskPid[address][pid] then
        copy.inviteCode = InviteCodesByInviterByTaskPid[address][pid]
      end

      -- print('reply task: ' .. json.encode(Tasks[pid]))
      u.replyData(msg, copy)
    end,

    GetTasksByCommunityUuid = function(msg)
      local cid = msg.Tags.CommunityUuid
      if not TasksByCommunity[cid] then
        u.replyData(msg, '[]')
        return
      end

      local tasks = {}
      for _, pid in pairs(TasksByCommunity[cid]) do
        if Tasks[pid] then
          table.insert(tasks, Tasks[pid])
        end
      end

      u.replyData(msg, tasks)
    end,

    GetTasksByOwner = function(msg)
      local address = msg.Tags.Address
      local tasks = {}
      for _, task in pairs(Tasks) do
        if task.ownerAddress == address then
          table.insert(tasks, task)
        end
      end

      u.replyData(msg, tasks)
    end,

    JoinTask = function(msg)
      local pid = msg.Tags.TaskPid
      if not Tasks[pid] then
        return u.replyError(msg, 'Task not found.')
      end

      assert(Tasks[pid].endTime > msg.Timestamp, 'The task has already ended.')

      if Tasks[pid].builders[msg.From] then
        return u.replyError(msg, 'You have joined this task.')
      end

      local builder = {
        address = msg.From,
        joinTime = msg.Timestamp
      }
      if msg.Tags.InviteCode then
        local invite = Invites[msg.Tags.InviteCode]
        if not invite then
          return u.replyError(msg, 'Invite code not found.')
        end

        builder.inviterAddress = invite.inviterAddress
        if not invite.invitees then
          invite.invitees = {}
        end
        if not invite.invitees[msg.From] then
          invite.invitees[msg.From] = { joinTime = msg.Timestamp }
        end
      end

      Tasks[pid].builders[msg.From] = builder

      -- create task invite code for the new builder
      local code = createInviteCode('task', msg.From, pid)
      u.replyData(msg, code)
    end,

    AddSubmission = function(msg)
      -- TOOD validate msg.Data
      --- @type Submission
      local submission = json.decode(msg.Data)
      local pid = submission.taskPid

      if not Tasks[pid] then
        return u.replyError(msg, 'Task not found.')
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
      local find = u.findIndex(Tasks[pid].submissions, function(submit)
        return submit.address == msg.From
      end)
      if not find then
        Tasks[pid].submittersCount = Tasks[pid].submittersCount + 1
      end

      u.replyData(msg, tostring(submission.id))
    end,

    UpdateSubmission = function(msg)
      local pid = msg.Tags.TaskPid
      local id = tonumber(msg.Tags.SubmissionID)
      local submission = json.decode(msg.Data)

      assert(msg.From == Tasks[pid].ownerAddress, 'You are not the owner of this task.')
      assert(Tasks[pid].submissions[id], 'Submission not found. pid: ' .. pid .. ', submission id: ' .. id)

      for key, value in pairs(submission) do
        if key ~= 'id' and key ~= 'createTime' then
          Tasks[pid].submissions[id][key] = value
        end
      end
    end,

    StoreBountySendHistory = function(msg)
      local pid = msg.Tags.TaskPid
      if not Tasks[pid] then
        return u.replyError(msg, 'Task not found.')
      end
      if Tasks[pid].ownerAddress ~= msg.From then
        return u.replyError(msg, 'You are not the owner of this task.')
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
      u.replyData(msg, bounties)
    end,

    GetBountiesByCommunityID = function(msg)
      local uuid = msg.Tags.CommunityUuid

      if not TasksByCommunity[uuid] then
        return u.replyData(msg, '[]')
      end

      local result = {}
      for _, taskPid in pairs(TasksByCommunity[uuid]) do
        if BountySendHistory[taskPid] then
          for _, bounty in pairs(BountySendHistory[taskPid]) do
            local copy = u.deepCopy(bounty)
            copy.recipientName = Users[copy.recipient].name
            table.insert(result, copy)
          end
        end
      end

      u.replyData(msg, result)
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
      u.replyData(msg, bounties)
    end,

    UpdateTaskScores = function(msg)
      local pid = msg.Tags.TaskPid

      if not Tasks[pid] then
        return u.replyError(msg, 'Task not found.')
      end

      if Tasks[pid].ownerAddress ~= msg.From then
        return u.replyError(msg, 'You are not the owner of this task.')
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
        return u.replyError(msg, 'Task not found.')
      end

      if Tasks[pid].ownerAddress ~= msg.From then
        return u.replyError(msg, 'You are not the owner of this task.')
      end

      Tasks[pid].submissions = json.decode(msg.Data)
    end
  },

  User = {
    RegisterUserOrLogin = function(msg)
      local address = msg.From
      local avatar = msg.Tags.Avatar
      local name = msg.Tags.UserName
      local user = {
        avatar = avatar,
        name = name
      }
      if not Users[address] then
        Users[address] = user
      end

      u.replyData(msg, Users[address])
    end,

    GetUserByAddress = function(msg)
      local userInfo = Users[msg.Tags.Address]
      if not userInfo then
        return u.replyError(msg, "Not found.")
      end

      u.replyData(msg, userInfo)
    end,

    GetUsersByCommunityUUID = function(msg)
      local uuid = msg.Tags.CommunityUuid
      local communityUsers = {}

      -- TODO use Communities[uuid].builders
      for address, inviteInfo in pairs(UserCommunities) do
        if inviteInfo[uuid] then
          if not Users[address] then
            Users[address] = { name = '', avatar = '' }
          end
          communityUsers[address] = Users[address]
          communityUsers[address].muted = false

          if MutedUsers[uuid] then
            for _, mutedAddress in ipairs(MutedUsers[uuid]) do
              if mutedAddress == address then
                communityUsers[address].muted = true
              end
            end
          end
        end
      end

      u.replyData(msg, communityUsers)
    end,

    -- TODO only update specific field, don't replace the whole Users[address]
    UpdateUser = function(msg)
      local address = msg.From
      local user = json.decode(msg.Data)
      -- TODO verify user fields

      Users[address] = user
    end,

  },

  Invites = {
    CreateInviteCode = function(msg)
      local address = msg.From
      local pid = msg.Tags.TaskPid
      local uuid = msg.Tags.CommunityUuid

      if not pid or not Tasks[pid] then
        if not uuid or not Communities[uuid] then
          return u.replyError(msg, 'Community not found.')
        end
        -- create invite code for the community
        local code = createInviteCode('community', address, uuid)
        return u.replyData(msg, code)
      end

      -- if msg.Timestamp > Tasks[pid].endTime then
      --   return Util.replyError(msg, 'The task has already ended.')
      -- end
      -- TODO check if address is a registered user
      local code = createInviteCode('task', address, pid)

      u.replyData(msg, code)
    end,

    GetInviteByCode = function(msg)
      local code = msg.Tags.Code
      if not Invites[code] then
        return u.replyError(msg, 'Invite not found.')
      end

      local invite = Invites[code]

      if invite.type == 'task' then
        local task = Tasks[invite.taskPid]
        if not task then
          return u.replyError(msg, 'Task not found.')
        end
        return u.replyData(msg, {
          invite = invite,
          task = task,
          community = Communities[task.communityUuid]
        })
      end

      if invite.type == 'community' then
        local community = Communities[invite.communityUuid]
        if not community then
          return u.replyError(msg, 'Community not found.')
        end

        return u.replyData(msg, {
          invite = invite,
          community = community,
        })
      end

      return u.replyError(msg, 'Invite type not supported.')
    end,

    GetInvitesByInviter = function(msg)
      local address = msg.Tags.Inviter
      local type = msg.Tags.InviteType
      if not InviteCodesByInviterByTaskPid[address] and not InviteCodesByInviterByCommunityUuid[address] then
        return u.replyData(msg, {invites = {}, relatedUsers = {}, relatedTasks = {}, relatedCommunities = {}})
      end

      ---@type Invite[]
      local invites = {}
      local relatedTasks = {}
      local relatedCommunities = {}
      if InviteCodesByInviterByTaskPid[address] then
        for pid, code in pairs(InviteCodesByInviterByTaskPid[address]) do
          local invite = Invites[code]
          if type and type ~= 'task' and invite.type == 'task' then
            goto continue
          end
          if u.tableLen(invite.invitees) > 0 then
            table.insert(invites, invite)
            relatedTasks[pid] = Tasks[pid]

            local community = Communities[invite.communityUuid]
            relatedCommunities[invite.communityUuid] = {
              uuid = invite.communityUuid,
              name = community.name,
              logo = community.logo,
            }
          end
          ::continue::
        end
      end

      if InviteCodesByInviterByCommunityUuid[address] then
        for uuid, code in pairs(InviteCodesByInviterByCommunityUuid[address]) do
          local invite = Invites[code]
          if type and type ~= 'community' and invite.type == 'community' then
            goto nextCode
          end
          if u.tableLen(invite.invitees) > 0 then
            table.insert(invites, invite)
            local community = Communities[uuid]
            relatedCommunities[uuid] = {
              uuid = uuid,
              name = community.name,
              logo = community.logo,
            }
          end
          ::nextCode::
        end
      end

      local relatedUsers = {}
      for _, invite in pairs(invites) do
        for inviteeAddress, _ in pairs(invite.invitees) do
          if not relatedUsers[inviteeAddress] and Users[inviteeAddress] then
            relatedUsers[inviteeAddress] = Users[inviteeAddress]
          end
        end
      end

      u.replyData(msg, {
        invites = invites,
        relatedUsers = relatedUsers,
        relatedTasks = relatedTasks,
        relatedCommunities = relatedCommunities
      })
    end,

  },

  -- TODO move to chatroom process?
  Chatroom = {
    Mute = function(msg)
      local cid = msg.Tags.CommunityUuid
      local community = Communities[cid]
      if not community then
        return u.replyError(msg, 'Community not found.')
      end

      local isPermitted = msg.From == community.owner
      if not isPermitted then
        for _, admin in pairs(community.admins) do
          if admin == msg.From then
            isPermitted = true
            break
          end
        end
      end
      if not isPermitted then
        return u.replyError(msg, 'Only owner or admins can mute.')
      end

      local userAddress = msg.Tags.User
      if userAddress == community.owner then
        return u.replyError(msg, 'You can not mute the owner.')
      end

      -- can not mute admins
      for _, admin in pairs(community.admins) do
        if admin == userAddress then
          return u.replyError(msg, 'You can not mute admins.')
        end
      end

      MutedUsers[cid] = MutedUsers[cid] or {}

      local userExists = false
      for _, user in ipairs(MutedUsers[cid]) do
        if user == userAddress then
          userExists = true
          break
        end
      end

      if not userExists then
        table.insert(MutedUsers[cid], userAddress)
      end
    end,

    Unmute = function(msg)
      local cid = msg.Tags.CommunityUuid
      local community = Communities[cid]
      if not community then
        return u.replyError(msg, 'Community not found.')
      end

      local isPermitted = msg.From == community.owner
      if not isPermitted then
        for _, admin in pairs(community.admins) do
          if admin == msg.From then
            isPermitted = true
            break
          end
        end
      end
      if not isPermitted then
        return u.replyError(msg, 'Only owner or admins can unmute.')
      end

      local userAddress = msg.Tags.User
      if msg.From ~= community.owner and userAddress == msg.From then
        return u.replyError(msg, 'You can not unmute yourself.')
      end

      if MutedUsers[cid] then
        for i, user in ipairs(MutedUsers[cid]) do
          if user == userAddress then
            table.remove(MutedUsers[cid], i)
            break
          end
        end
      end
    end,

    GetMutedUsers = function(msg)
      local uuid = msg.Tags.CommunityUuid
      if not MutedUsers[uuid] then
        return u.replyData(msg, '[]')
      end
      u.replyData(msg, MutedUsers[uuid])
    end
  },
}

for _, actions in pairs(Actions) do
  for name, action in pairs(actions) do
    Handlers.add(
      name, -- TODO action name should be unique, use _ .. '.' .. name as action name
      name,
      function(msg) action(msg) end
    )
  end
end