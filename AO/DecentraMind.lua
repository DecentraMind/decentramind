Variant = '1.0.100'
Name = 'DecentraMind-' .. Variant

local json = require("json")
local u = require("u")
VouchProcessId = 'ZTTO02BL2P-lseTLUgiIPD9d0CF1sc4LbMA2AQ7e9jo'
DefaultUserAvatar = 'gAh_m4pAU-PCAvDfDkv-6MPKp46E7MpaGlfwvZV-cgw'
ValidVouchers = {
  'N29ZBiXqWtQK-COOJh9ZQrnMV2btE8XoBy8vyApVYWw', -- DecentraMind voucher
  'Ax_uXyLQBPZSQ15movzv9-O1mDo30khslqN64qD27Z8' -- VouchDAO voucher
}
DM_SUPER_ADMIN = 'fk8kHzwZ8mQUq31RmZkzBwZK7_jYQAXyX5WNoGYp8z8'

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
---@field isPrivateApplicable boolean @Whether community members can apply to join the private area

--- @type table<string, Community> Communities indexed by community's uuid
Communities = Communities or {}

---@class User
---@field name string
---@field avatar string
---@field createdAt? number @creation timestamp
---@field canCreateCommunity? boolean @whether the user has created a community

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
--- @field brandEffect number|nil
--- @field inviteCount number|nil
--- @field audience number|nil
--- @field url string|nil
--- @field createTime number
--- @field updateTime number
--- @field validateStatus string @Status of the submission, either 'waiting_for_validation', 'validated', 'invalid', 'validation_error', 'revalidated'
--- @field validateError string|nil @Error message if the submission was invalidated
--- @field validateTime number|nil @Timestamp when the submission was validated
--- @field validator string|nil @Address of the validator

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
---@field privateUnlockTime number|nil @Timestamp when the private area application is approved, use this field to check if the invitee can access the private area

---@type table<string, table<string, UserCommunity>> This is user-communities relation. Invite Codes by invitee address and community uuid. This index is used for querying user's joined communities.
UserCommunities = UserCommunities or {}

---@type table<string, string[]> Questions that need to be answered when applying to join a community's private area, indexed by community uuid
QuestionsByCommunityUuid = QuestionsByCommunityUuid or {}

---@type table<string, table<string, string[]>> Answers by community uuid and address, indexed by community uuid and applicant address
AnswersByCommunityUuidByAddress = AnswersByCommunityUuidByAddress or {}

---@class Page
---@field uuid string @UUID of the private area page
---@field communityUuid string @UUID of the community
---@field title string @Title of the private area page
---@field content string @Content of the private area page

---@type table<string, Page> Pages by page uuid
Pages = Pages or {}

---@class PrivateTaskBudget: TaskBounty
---@field member string @Address of the member
---@field settleTx string|nil @Transaction ID of the token send

---@class PrivateTask
---@field uuid string @UUID of the private task
---@field boardUuid string @UUID of the private task board
---@field title string @Title of the private task
---@field description string @Description of the private task
---@field budgets PrivateTaskBudget[] @Budgets of the private task
---@field status string 'draft' | 'auditing' | 'executing' | 'waiting_for_validation' | 'waiting_for_settlement' | 'settled'
---@field editors string[] @Addresses of the editors
---@field startAt number @Start time of the private task
---@field endAt number @End time of the private task
---@field executionResult string @Execution result of the private task, editable when status is 'executing'
---@field createdAt number @Creation time of the private task
---@field updatedAt number @Update time of the private task
---@field deletedAt number|nil @Deletion time of the private task

---@class Board
---@field uuid string @UUID of the private task board
---@field communityUuid string @UUID of the community
---@field title string @Title of the private task board
---@field taskUuids string[] @UUIDs of the private tasks

---@type table<string, Board> Boards by board uuid
Boards = Boards or {}

---@class PrivateAreaConfig
---@field communityUuid string @UUID of the community
---@field pagesAreaTitle string @Title of the private area
---@field pageUuids string[] @UUIDs of the pages
---@field boardUuids string[] @UUIDs of the boards

---@type table<string, PrivateAreaConfig> Private area config, indexed by community uuid
PrivateAreaConfig = PrivateAreaConfig or {}


--- @type table<string, PrivateTask> @private tasks table using private task's uuid as key
PrivateTasks = PrivateTasks or {}


---@class Log
---@field operation string 'approveToPrivate' | 'rejectToPrivate' | 'removePrivateMember'
---@field communityUuid string
---@field operator string
---@field params table<string, any>
---@field timestamp number

---@type table<string, Log[]> Logs by community uuid, indexed by community uuid
Logs = Logs or {}

---@type table<string, number[]> Logs indexes by community uuid
LogsByCommunityUuid = LogsByCommunityUuid or {}

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

---@param address string
---@param avatar string|nil
---@param name string|nil
---@param createdAt number
local function registerUser(address, createdAt, avatar, name)
  -- TODO check vouch data
  if not Users[address] then
    Users[address] = {
      avatar = avatar or DefaultUserAvatar,
      name = name or string.sub(address, -4),
      createdAt = createdAt,
      canCreateCommunity = false
    }
  end
end

local function addLog(operation, communityUuid, operator, params, timestamp)
  table.insert(Logs, {
    operation = operation,
    communityUuid = communityUuid,
    operator = operator,
    params = params,
    timestamp = timestamp
  })
  LogsByCommunityUuid[communityUuid] = LogsByCommunityUuid[communityUuid] or {}
  table.insert(LogsByCommunityUuid[communityUuid], #Logs)
end

local function isCommunityAdmin(community, address)
  return u.findIndex(community.admins, function(admin) return admin == address end)
end

local function assertIsOwnerOrAdmin(address, communityUuid)
  local community = Communities[communityUuid]
  assert(community, 'Community not found.')

  local isOwner = address == community.owner
  local isAdmin = isCommunityAdmin(community, address)
  assert(isOwner or isAdmin, 'You are not the owner or admin.')
end

local function assertPrivateUnlocked(address, communityUuid)
  local community = Communities[communityUuid]
  assert(community, 'Community not found.')
  -- user must join the community
  assert(UserCommunities[address] and UserCommunities[address][communityUuid], 'You have not joined the community.')

  local isOwner = address == community.owner
  local isAdmin = isCommunityAdmin(community, address)
  -- only private members(privateUnlockTime is not nil) can add task
  assert(UserCommunities[address][communityUuid].privateUnlockTime or isOwner or isAdmin, 'You are not in the private area.')
end

Actions = {
  Community = {
    CreateCommunity = function(msg)
      local community = json.decode(msg.Data)
      local address = msg.From

      -- Check if user is allowed to create community
      if not Users[address] then
        return u.replyError(msg, 'User not found. Please login first.')
      end
      assert(Users[address].canCreateCommunity, 'You are not allowed to create community.')

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
      copy.privateUnlockTime = nil
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

          if UserCommunities[address][uuid].privateUnlockTime then
            copy.privateUnlockTime = UserCommunities[address][uuid].privateUnlockTime
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

        if UserCommunities[address][uuid].privateUnlockTime then
          copy.privateUnlockTime = UserCommunities[address][uuid].privateUnlockTime
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

      local community = Communities[uuid]
      assert(community, 'Community not found.')

      --- if user has already joined the community, return
      if UserCommunities[address] and UserCommunities[address][uuid] then
        return
      end

      if community.buildnum then
        community.buildnum = community.buildnum + 1
      else
        community.buildnum = 1
      end

      if not Users[address] then
        return u.replyError(msg, 'User not found. Please login first.')
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
        if Invites[inviteCode] and Invites[inviteCode].inviterAddress ~= address then
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

    UpdateIsPrivateApplicable = function(msg)
      local uuid = msg.Tags.CommunityUuid
      local applicable = string.lower(msg.Tags.Applicable)
      assert(applicable == "true" or applicable == "false", 'Invalid applicable value.')

      local community = Communities[uuid]
      if not community then
        return u.replyError(msg, 'Community not found.')
      end

      assert(msg.From == community.owner, 'You are not the owner of this community.')

      community.isPrivateApplicable = applicable == "true"

      local haveQuestions = QuestionsByCommunityUuid[uuid] and #QuestionsByCommunityUuid[uuid] > 0
      if community.isPrivateApplicable and not haveQuestions then
        -- add one default question
        QuestionsByCommunityUuid[uuid] = { 'Why do you want to join this private area?' }
      end
    end,

    GetQuestions = function(msg)
      local questions = QuestionsByCommunityUuid[msg.Tags.CommunityUuid]
      u.replyData(msg, questions or {})
    end,

    UpdateQuestions = function(msg)
      local questions = json.decode(msg.Data)
      local uuid = msg.Tags.CommunityUuid

      local community = Communities[uuid]
      if not community then
        return u.replyError(msg, 'Community not found.')
      end

      assertIsOwnerOrAdmin(msg.From, uuid)

      QuestionsByCommunityUuid[uuid] = questions
    end,

    -- save answers to community
    SubmitAnswers = function(msg)
      local answers = json.decode(msg.Data)
      local uuid = msg.Tags.CommunityUuid
      local address = msg.From

      if not QuestionsByCommunityUuid[uuid] then
        return u.replyError(msg, 'Questions not found.')
      end

      -- applicant must join the community
      if not UserCommunities[address] or not UserCommunities[address][uuid] then
        return u.replyError(msg, 'You have not joined the community.')
      end

      -- if applicant is already in the private area, return
      if UserCommunities[address][uuid].privateUnlockTime then
        return u.replyError(msg, 'You are already in the private area.')
      end

      -- if applicant has already submitted answers, return
      if AnswersByCommunityUuidByAddress[uuid] and AnswersByCommunityUuidByAddress[uuid][address] then
        return u.replyError(msg, 'You have already submitted answers, please wait for approval.')
      end

      -- applicant must answer all questions
      if #answers ~= #QuestionsByCommunityUuid[uuid] then
        return u.replyError(msg, 'You must answer all questions.')
      end

      if not AnswersByCommunityUuidByAddress[uuid] then
        AnswersByCommunityUuidByAddress[uuid] = {}
      end

      AnswersByCommunityUuidByAddress[uuid][address] = answers
    end,

    GetApplications = function(msg)
      local uuid = msg.Tags.CommunityUuid
      local applications = {}
      if not AnswersByCommunityUuidByAddress[uuid] then
        u.replyData(msg, '[]')
        return
      end
      for address, answers in pairs(AnswersByCommunityUuidByAddress[uuid]) do
        local user = Users[address]
        if not user then
          goto nextApplication
        end

        table.insert(applications, {
          address = address,
          name = user.name,
          avatar = user.avatar,
          answers = answers
        })

        ::nextApplication::
      end
      u.replyData(msg, applications)
    end,

    ApproveOrRejectApplication = function(msg)
      local uuid = msg.Tags.CommunityUuid
      local address = msg.Tags.Address
      local operation = msg.Tags.Operation

      -- only owner or admins can approve application
      local community = Communities[uuid]
      if not community then
        return u.replyError(msg, 'Community not found.')
      end

      if msg.From ~= community.owner then
        return u.replyError(msg, 'You are not the owner.')
      end

      if not AnswersByCommunityUuidByAddress[uuid] or not AnswersByCommunityUuidByAddress[uuid][address] then
        return u.replyError(msg, 'Application not found.')
      end

      if operation == 'approve' then
        AnswersByCommunityUuidByAddress[uuid][address] = nil
        UserCommunities[address][uuid].privateUnlockTime = msg.Timestamp
        addLog('approveToPrivate', uuid, msg.From, { address = address }, msg.Timestamp)
        u.replyData(msg, 'Application approved.')
      elseif operation == 'reject' then
        AnswersByCommunityUuidByAddress[uuid][address] = nil
        addLog('rejectToPrivate', uuid, msg.From, { address = address }, msg.Timestamp)
        LogsByCommunityUuid[uuid] = LogsByCommunityUuid[uuid] or {}
        table.insert(LogsByCommunityUuid[uuid], #Logs)
        u.replyData(msg, 'Application rejected.')
      else
        return u.replyError(msg, 'Invalid operation.')
      end
    end,

    GetPrivateUnlockMembers = function(msg)
      local uuid = msg.Tags.CommunityUuid
      local members = {}
      for address, userCommunity in pairs(UserCommunities) do
        if userCommunity[uuid] and userCommunity[uuid].privateUnlockTime then
          local user = u.deepCopy(Users[address])
          if not user then
            goto nextMember
          end
          user.address = address
          table.insert(members, user)

          ::nextMember::
        end
      end
      -- add community owner and admins
      local community = Communities[uuid]
      local owner = u.deepCopy(Users[community.owner])
      if owner then
        owner.address = community.owner
        table.insert(members, owner)
      end
      for _, admin in ipairs(community.admins) do
        local adminUser = u.deepCopy(Users[admin])
        if adminUser and not u.findIndex(members, function(member) return member.address == admin end) then
          adminUser.address = admin
          table.insert(members, adminUser)
        end
      end

      u.replyData(msg, members)
    end,

    RemovePrivateUnlockMember = function(msg)
      local uuid = msg.Tags.CommunityUuid
      local address = msg.Tags.Address
      local reason = msg.Tags.Reason

      local community = Communities[uuid]
      if not community then
        return u.replyError(msg, 'Community not found.')
      end

      -- only owner or admins can remove private unlock member
      assertIsOwnerOrAdmin(msg.From, uuid)

      if not UserCommunities[address] or not UserCommunities[address][uuid] then
        return u.replyError(msg, 'The address is not a member of this community.')
      end

      UserCommunities[address][uuid].privateUnlockTime = nil
      addLog('removePrivateMember', uuid, msg.From, { address = address, reason = reason }, msg.Timestamp)
    end,

    GetPrivateAreaConfig = function(msg)
      local uuid = msg.Tags.CommunityUuid
      local copy = u.deepCopy(PrivateAreaConfig[uuid] or {
        pagesAreaTitle = 'Private Area',
        pageUuids = {},
        boardUuids = {}
      })

      -- get pages from pageUuids
      copy.pages = {}
      for _, pageUuid in pairs(copy.pageUuids) do
        if Pages[pageUuid] then
          table.insert(copy.pages, Pages[pageUuid])
        end
      end

      copy.boards = {}
      for _, boardUuid in pairs(copy.boardUuids) do
        if Boards[boardUuid] then
          local boardCopy = u.deepCopy(Boards[boardUuid])
          boardCopy.tasks = {}
          if Boards[boardUuid].taskUuids then
            for _, taskUuid in pairs(Boards[boardUuid].taskUuids) do
              if PrivateTasks[taskUuid] and PrivateTasks[taskUuid].deletedAt == nil then
                table.insert(boardCopy.tasks, PrivateTasks[taskUuid])
              end
            end
          end
          table.insert(copy.boards, boardCopy)
        end
      end

      u.replyData(msg, copy)
    end,

    UpdatePrivateAreaConfig = function(msg)
      local uuid = msg.Tags.CommunityUuid
      ---@type PrivateAreaConfig
      local update = json.decode(msg.Data)
      local community = Communities[uuid]
      assert(community, 'Community not found.')

      assertIsOwnerOrAdmin(msg.From, uuid)

      PrivateAreaConfig[uuid] = PrivateAreaConfig[uuid] or {
        pagesAreaTitle = 'Private Area',
        pageUuids = {},
        boardUuids = {}
      }

      ---@type PrivateAreaConfig
      local configCopy
      if not PrivateAreaConfig[uuid] then
        configCopy = {
          communityUuid = uuid,
          pagesAreaTitle = 'Private Area',
          pageUuids = {},
          boardUuids = {}
        }
      else
        configCopy = u.deepCopy(PrivateAreaConfig[uuid])
      end

      if update.pagesAreaTitle then
        configCopy.pagesAreaTitle = update.pagesAreaTitle
      end

      if update.pageUuids then
        for _, pageUuid in pairs(update.pageUuids) do
          assert(Pages[pageUuid], 'Page ' .. pageUuid .. ' not found.')
          if not u.findIndex(configCopy.pageUuids, function(localUuid) return localUuid == pageUuid end) then
            table.insert(configCopy.pageUuids, pageUuid)
          end
        end
      end

      if update.boardUuids then
        for _, boardUuid in pairs(update.boardUuids) do
          assert(Boards[boardUuid], 'Board ' .. boardUuid .. ' not found.')
          if not u.findIndex(configCopy.boardUuids, function(localUuid) return localUuid == boardUuid end) then
            table.insert(configCopy.boardUuids, boardUuid)
          end
        end
      end

      PrivateAreaConfig[uuid] = configCopy
      u.replyData(msg, configCopy)
    end,

    AddBoard = function(msg)
      local title = msg.Tags.Title
      local uuid = msg.Tags.CommunityUuid
      local community = Communities[uuid]
      assert(community, 'Community not found.')
      assert(title, 'Title is required.')

      -- only owner or admins can add board
      assertIsOwnerOrAdmin(msg.From, uuid)

      PrivateAreaConfig[uuid] = PrivateAreaConfig[uuid] or {
        pagesAreaTitle = 'Private Area',
        pageUuids = {},
        boardUuids = {}
      }

      local boardUuid = u.createUuid()
      Boards[boardUuid] = {
        uuid = boardUuid,
        communityUuid = uuid,
        title = title,
        taskUuids = {}
      }

      PrivateAreaConfig[uuid].boardUuids = PrivateAreaConfig[uuid].boardUuids or {}
      table.insert(PrivateAreaConfig[uuid].boardUuids, boardUuid)

      u.replyData(msg, Boards[boardUuid])
    end,

    UpdateBoardTitle = function(msg)
      local boardUuid = msg.Tags.BoardUuid
      local title = msg.Tags.Title

      local board = Boards[boardUuid]
      if not board then
        return u.replyError(msg, 'Work area not found.')
      end

      -- only owner or admins can update board name
      assertIsOwnerOrAdmin(msg.From, board.communityUuid)

      board.title = title
      u.replyData(msg, board)
    end,

    GetPrivateTask = function(msg)
      local taskUuid = msg.Tags.TaskUuid
      local task = PrivateTasks[taskUuid]
      assert(task, 'Task not found.')
      u.replyData(msg, task)
    end,

    AddPrivateTask = function(msg)
      local address = msg.From

      ---@type PrivateTask
      local task = json.decode(msg.Data)
      -- only accept 'draft' | 'auditing' status
      assert(task.status == 'draft' or task.status == 'auditing', 'Invalid status.')
      assert(task.title and #task.title > 0, 'Title is required.')
      assert(task.description and #task.description > 0, 'Description is required.')
      assert(task.boardUuid, 'Board uuid is required.')
      assert(task.budgets and #task.budgets > 0, 'Budgets are required.')

      -- check budgets
      for _, budget in ipairs(task.budgets) do
        assert(budget.tokenProcessID, 'Token process ID is required.')
        assert(budget.amount > 0, 'Amount must be greater than 0.')
        assert(budget.quantity, 'Quantity is required.')
        assert(string.match(budget.quantity, "^[1-9]%d*$") and tonumber(budget.quantity) > 0, 'Quantity must be a numeric value greater than 0.')
      end

      local board = Boards[task.boardUuid]
      assert(board, 'Board ' .. task.boardUuid .. ' not found.')
      local uuid = board.communityUuid

      assertPrivateUnlocked(address, uuid)

      local config = PrivateAreaConfig[uuid]
      if not config then
        return u.replyError(msg, 'Private area config not found.')
      end

      local taskUuid = u.createUuid()
      task.uuid = taskUuid
      task.editors = { msg.From }
      PrivateTasks[taskUuid] = task
      PrivateTasks[taskUuid].createdAt = msg.Timestamp
      PrivateTasks[taskUuid].updatedAt = msg.Timestamp

      table.insert(board.taskUuids, taskUuid)
      -- add log
      addLog('AddPrivateTask', uuid, msg.From, {
        taskUuid = taskUuid
      }, msg.Timestamp)

      u.replyData(msg, PrivateTasks[taskUuid])
    end,

    -- save proposal or executing private task content, only for task editors
    SaveProposal = function(msg)
      ---@type PrivateTask
      local task = json.decode(msg.Data)
      assert(PrivateTasks[task.uuid], 'Proposal not found.')

      assert(PrivateTasks[task.uuid].status == 'draft' or PrivateTasks[task.uuid].status == 'executing', 'Only draft proposal or executing proposal can be updated.')

      if PrivateTasks[task.uuid].status == 'draft' then
        assert(task.status == 'draft' or task.status == 'auditing', 'Status must be "draft" or "auditing".')
      elseif PrivateTasks[task.uuid].status == 'executing' then
        assert(task.status == 'executing' or task.status == 'auditing' or task.status == 'waiting_for_validation', 'Status must be "executing" or "waiting_for_validation".')
      end

      local boardUuid = task.boardUuid
      local board = Boards[boardUuid]
      assert(board, 'Board not found.')
      local communityUuid = board.communityUuid

      assertPrivateUnlocked(msg.From, communityUuid)
      assert(u.findIndex(PrivateTasks[task.uuid].editors, function(editor) return editor == msg.From end), 'You are not the editor of this proposal.')

      PrivateTasks[task.uuid] = task
      PrivateTasks[task.uuid].updatedAt = msg.Timestamp
      -- add log
      addLog('SaveProposal', communityUuid, msg.From, {
        taskUuid = task.uuid
      }, msg.Timestamp)
      u.replyData(msg, PrivateTasks[task.uuid])
    end,

    -- delete proposal, only for task editors
    DeleteProposal = function(msg)
      local taskUuid = msg.Tags.TaskUuid
      assert(PrivateTasks[taskUuid], 'Proposal not found.')

      assert(PrivateTasks[taskUuid].status == 'draft' or PrivateTasks[taskUuid].status == 'executing', 'Only draft proposal or executing proposal can be deleted.')

      local boardUuid = PrivateTasks[taskUuid].boardUuid
      local board = Boards[boardUuid]
      assert(board, 'Board not found.')
      local communityUuid = board.communityUuid

      assertPrivateUnlocked(msg.From, communityUuid)
      assert(u.findIndex(PrivateTasks[taskUuid].editors, function(editor) return editor == msg.From end), 'You are not the editor of this proposal.')

      PrivateTasks[taskUuid].deletedAt = msg.Timestamp
      PrivateTasks[taskUuid].updatedAt = msg.Timestamp
      -- add log
      addLog('DeleteProposal', communityUuid, msg.From, {
        taskUuid = taskUuid
      }, msg.Timestamp)
      u.replyData(msg, PrivateTasks[taskUuid])
    end,

    -- update private task status, only for community owner or admins
    UpdatePrivateTaskStatus = function(msg)
      local taskUuid = msg.Tags.TaskUuid
      local operation = msg.Tags.Operation
      assert(PrivateTasks[taskUuid], 'Proposal not found.')
      assert(operation == 'approve' or operation == 'reject', 'Operation must be "approve" or "reject".')

      assert(PrivateTasks[taskUuid].status == 'auditing' or PrivateTasks[taskUuid].status == 'waiting_for_validation', 'Only auditing or waiting for validation proposal can be updated.')

      local boardUuid = PrivateTasks[taskUuid].boardUuid
      local board = Boards[boardUuid]
      assert(board, 'Board not found.')
      local communityUuid = board.communityUuid

      assertPrivateUnlocked(msg.From, communityUuid)
      assertIsOwnerOrAdmin(msg.From, communityUuid)

      local oldStatus = PrivateTasks[taskUuid].status
      local newStatus = oldStatus
      if operation == 'approve' then
        if oldStatus == 'auditing' then
          newStatus = 'executing'
        elseif oldStatus == 'waiting_for_validation' then
          newStatus = 'waiting_for_settlement'
        end
      elseif operation == 'reject' then
        if oldStatus == 'auditing' then
          newStatus = 'draft'
        elseif oldStatus == 'waiting_for_validation' then
          newStatus = 'executing'
        end
      end
      -- TODO only update status and executionResult
      PrivateTasks[taskUuid].status = newStatus
      PrivateTasks[taskUuid].updatedAt = msg.Timestamp
      -- add log
      addLog('UpdatePrivateTaskStatus', communityUuid, msg.From, {
        taskUuid = taskUuid,
        operation = operation
      }, msg.Timestamp)
      u.replyData(msg, PrivateTasks[taskUuid])
    end,

    GetLogs = function(msg)
      local uuid = msg.Tags.CommunityUuid
      local logs = LogsByCommunityUuid[uuid]
      if not logs then
        return u.replyData(msg, '[]')
      end
      local result = {}
      for i = #logs, 1, -1 do
        local logIndex = logs[i]
        local log = Logs[logIndex]
        if Users[log.operator] then
          log.operatorName = Users[log.operator].name
          log.operatorAvatar = Users[log.operator].avatar
        end
        if log.params.address and Users[log.params.address] then
          log.params.name = Users[log.params.address].name
          log.params.avatar = Users[log.params.address].avatar
        end
        table.insert(result, log)
      end
      u.replyData(msg, result)
    end,

    UpdateSettleTx = function(msg)
      local taskUuid = msg.Tags.TaskUuid
      local budgetIndex = tonumber(msg.Tags.BudgetIndex)
      local settleTx = msg.Tags.SettleTx

      local task = PrivateTasks[taskUuid]
      assert(task, 'Task not found.')
      assert(task.status ~= 'settled', 'This task is already settled.')
      assert(budgetIndex and budgetIndex > 0 and budgetIndex <= #task.budgets, 'Invalid budget index.')
      assert(settleTx, 'Settlement transaction ID is required.')

      -- Check that budget doesn't already have a settleTx
      assert(not task.budgets[budgetIndex].settleTx, 'This budget has already been settled.')

      -- Only owner or admins can update settleTx
      local board = Boards[task.boardUuid]
      assert(board, 'Board not found.')
      local communityUuid = board.communityUuid
      assertIsOwnerOrAdmin(msg.From, communityUuid)

      -- Update the settleTx
      task.budgets[budgetIndex].settleTx = settleTx

      -- Check if all budgets are settled and update task status if so
      local allSettled = true
      for _, budget in ipairs(task.budgets) do
        if not budget.settleTx then
          allSettled = false
          break
        end
      end

      if allSettled then
        task.status = 'settled'
      end

      task.updatedAt = msg.Timestamp

      -- Add log
      addLog('UpdateSettleTx', communityUuid, msg.From, {
        taskUuid = taskUuid,
        budgetIndex = budgetIndex,
        settleTx = settleTx
      }, msg.Timestamp)

      u.replyData(msg, task)
    end
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
      local address = msg.Tags.Address

      if not Tasks[pid] then
        return u.replyError(msg, 'Task not found.')
      end
      local copy = u.deepCopy(Tasks[pid])

      if address and InviteCodesByInviterByTaskPid[address] and InviteCodesByInviterByTaskPid[address][pid] then
        copy.inviteCode = InviteCodesByInviterByTaskPid[address][pid]
      end

      -- print('reply task: ' .. json.encode(Tasks[pid]))
      u.replyData(msg, copy)
    end,

    GetUnsettledTasks = function(msg)
      local tasks = {}
      for _, task in pairs(Tasks) do
        if not task.isSettled then
          table.insert(tasks, task)
        end
      end
      u.replyData(msg, tasks)
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

    GetUnsettledTasksByCommunityUuid = function(msg)
      local cid = msg.Tags.CommunityUuid
      local tasks = {}
      for _, task in pairs(Tasks) do
        if task.communityUuid == cid and not task.isSettled then
          table.insert(tasks, task)
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

      -- check if the user has joined the community
      local cid = Tasks[pid].communityUuid
      if not UserCommunities[msg.From] or not UserCommunities[msg.From][cid] then
        return u.replyError(msg, 'You have not joined the community.')
      end

      assert(Tasks[pid].endTime > msg.Timestamp, 'The task has already ended.')

      if Tasks[pid].builders[msg.From] then
        return u.replyError(msg, 'You have joined this task.')
      end

      if not Users[msg.From] then
        return u.replyError(msg, 'User not found. Please login first.')
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
        if invite.inviterAddress ~= msg.From and not invite.invitees[msg.From] then
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
      if submission.address ~= msg.From then
        return u.replyError(msg, 'You are not the submitter of this submission.')
      end

      assert(Tasks[pid].endTime > msg.Timestamp, 'The task has already ended.')

      --- for each task, every builder can submit only one submission
      for _, taskSubmission in pairs(Tasks[pid].submissions) do
        if taskSubmission.address ~= msg.From then
          goto nextSubmission
        end
        if taskSubmission.validateStatus == 'validated' or taskSubmission.validateStatus == 'revalidated' or taskSubmission.validateStatus == 'waiting_for_validation' then
          return u.replyError(msg, 'You have already submitted a submission for this task.')
        end

        -- set previous validation_error submission to invalid to avoid multiple submissions
        if taskSubmission.validateStatus == 'validation_error' then
          taskSubmission.validateStatus = 'invalid'
        end

        ::nextSubmission::
      end

      --- TODO if not Tasks[pid].builders[msg.From] then Tasks[pid].builders[msg.From] = builder end
      submission.id = #Tasks[pid].submissions + 1
      submission.score = 0
      submission.createTime = msg.Timestamp
      submission.updateTime = msg.Timestamp
      submission.validateStatus = 'waiting_for_validation'
      if Tasks[pid].type == 'space' then
        submission.brandEffect = 0
        submission.inviteCount = 0
        submission.audience = 0
      elseif Tasks[pid].type == 'promotion' or Tasks[pid].type == 'bird' or Tasks[pid].type == 'article' then
        submission.buzz = 0
        submission.discuss = 0
        submission.identify = 0
        submission.popularity = 0
        submission.spread = 0
        submission.friends = 0
      end

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

    -- update specific submission
    UpdateSubmission = function(msg)
      local pid = msg.Tags.TaskPid
      local id = tonumber(msg.Tags.SubmissionID)
      local submission = json.decode(msg.Data)

      -- TODO allow community owner to update submission
      assert(msg.From == Tasks[pid].ownerAddress or msg.From == Owner, 'You are not permitted to update this submission.')
      assert(Tasks[pid].submissions[id], 'Submission not found. pid: ' .. pid .. ', submission id: ' .. id)

      for key, value in pairs(submission) do
        if key ~= 'id' and key ~= 'createTime' then
          -- TODO find by submission.id instead of index
          -- for _, taskSubmission in pairs(Tasks[pid].submissions) do
          --   if taskSubmission.id == id then
          --     taskSubmission[key] = value
          --     taskSubmission.updateTime = msg.Timestamp
          --   end
          -- end
          Tasks[pid].submissions[id][key] = value
        end
      end
      Tasks[pid].submissions[id].updateTime = msg.Timestamp
      Tasks[pid].submissions[id].validator = msg.From
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
            copy.recipientName = Users[copy.recipient] and Users[copy.recipient].name or nil
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

    -- update all submissions scores of a task
    -- and set task.isScoreCalculated to true
    UpdateTaskScores = function(msg)
      local pid = msg.Tags.TaskPid

      if not Tasks[pid] then
        return u.replyError(msg, 'Task not found.')
      end

      if Tasks[pid].ownerAddress ~= msg.From and msg.From ~= Owner then
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

    -- update all submissions of a task
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
    end,

    UpdateTaskSubmissionBounties = function(msg)
      local pid = msg.Tags.TaskPid
      --- @type Submission[]
      local submissions = json.decode(msg.Data)

      if not Tasks[pid] then
        return u.replyError(msg, 'Task not found.')
      end

      for _, submission in pairs(Tasks[pid].submissions) do
        local find = u.findIndex(submissions, function(s)
          return s.id == submission.id
        end)
        -- if this submission is in the submissions array, update the calculatedBounties
        if find then
          submission.calculatedBounties = submissions[find].calculatedBounties
        end
        -- if this submission is not in the submissions array, remove the calculatedBounties
        if not find then
          submission.calculatedBounties = nil
        end
      end
    end
  },

  User = {
    RegisterUserOrLogin = function(msg)
      -- fetchVouchedIdentifiers may take a long time, so disable it for now
      -- local vouchedIdentifiers = u.fetchVouchedIdentifiers(msg.From, 'X', ValidVouchers)
      -- if #vouchedIdentifiers == 0 then
      --   return u.replyError(msg, 'You are not vouched.')
      -- end

      registerUser(
        msg.From,
        msg.Timestamp,
        msg.Tags.Avatar,
        msg.Tags.UserName -- or vouchedIdentifiers[1]
      )

      u.replyData(msg, Users[msg.From])
    end,

    GetUserByAddress = function(msg)
      local userInfo = Users[msg.Tags.Address]
      if not userInfo then
        return u.replyError(msg, "Not found.")
      end

      u.replyData(msg, userInfo)
    end,

    GetAllUsers = function(msg)
      local users = {}
      for address, user in pairs(Users) do
        users[address] = user
        users[address].address = address
        -- TODO if this user is invited by other users, add the inviter to the user
      end
      u.replyData(msg, users)
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
          communityUsers[address].address = address
          communityUsers[address].muted = false

          communityUsers[address].joinTime = inviteInfo[uuid].joinTime
          communityUsers[address].privateUnlockTime = inviteInfo[uuid].privateUnlockTime
          if inviteInfo[uuid].inviteCode and Invites[inviteInfo[uuid].inviteCode] then
            communityUsers[address].inviteCode = inviteInfo[uuid].inviteCode
            communityUsers[address].inviterAddress = Invites[inviteInfo[uuid].inviteCode].inviterAddress
            local inviter = Users[Invites[inviteInfo[uuid].inviteCode].inviterAddress]
            if inviter and inviter.name then
              communityUsers[address].inviterName = inviter.name
            end
          end

          if MutedUsers[uuid] then
            for _, mutedAddress in ipairs(MutedUsers[uuid]) do
              if mutedAddress == address then
                communityUsers[address].muted = true
              end
            end
          else
            communityUsers[address].muted = false
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

    EnableCommunityCreation = function(msg)
      local address = msg.Tags.Address
      local isPermitted = msg.From == Owner or msg.From == DM_SUPER_ADMIN
      if not isPermitted then
        return u.replyError(msg, 'You are not permitted to enable community creation.')
      end
      if not Users[address] then
        return u.replyError(msg, 'User not found.')
      end

      Users[address].canCreateCommunity = true
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