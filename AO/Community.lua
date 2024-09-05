Name = 'DecentraMind Community Manager'
Variant = '0.2.16'

local json = require("json")
local ao = require(".ao")

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

--- @type table<string, Community>
Communities = Communities or {}

---@class InviteInfo
---@field invite string|nil The inviter's address, who invited this user
---@field time number The timestamp when user join community.


--- User's community related data
---@type table<string, table<string, InviteInfo>>
---{
---  [address: string]: { -- the user
---    [communityID: string]: InviteInfo
---  }
-- }
CommunityInvites = Invites or {}

---@class User
---@field name string
---@field avatar string

---@type table<string, User>
Users = Users or {}

--- @type table<string, string[]> table of community's muted user addresses
MutedUsers = MutedUsers or {}


local function deepCopy(orig)
  local orig_type = type(orig)
  local copy
  if orig_type == 'table' then
    copy = {}
    for orig_key, orig_value in next, orig, nil do
      copy[deepCopy(orig_key)] = deepCopy(orig_value)
    end
    setmetatable(copy, deepCopy(getmetatable(orig)))
  else -- number, string, boolean, etc
    copy = orig
  end
  return copy
end

local function createUuid()
  local template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
  return string.gsub(template, '[xy]', function(c)
    local v = (c == 'x') and math.random(0, 0xf) or math.random(8, 0xb)
    return string.format('%x', v)
  end)
end

local function replyError(request, errorMsg)
  local action = (request.Tags and request.Tags.Action) or request.Action or "Unknow-Action"
  action = action .. "-Error"
  local errString = errorMsg
  if type(errorMsg) ~= "string" then
    errString = json.encode(errorMsg)
  end

  print('Reply ' .. action .. ' ' .. errString)
  ao.send({ Target = request.From, Action = action, ["Message-Id"] = request.Id, Error = errString })
end

---Reply with data
---@param data string|table
local function replyData(request, data)
  assert(type(data) == 'table' or type(data) == 'string', 'Invalid reply data type.')
  if type(data) == 'string' then
    ao.send({ Target = request.From,  Data = data })
  else
    ao.send({ Target = request.From,  Data = json.encode(data) })
  end
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

      local uuid = createUuid()

      if Communities[uuid] then
        return replyError(msg, 'uuid existed.')
      end

      Communities[uuid] = community
      Communities[uuid].uuid = uuid
      Communities[uuid].creator = address
      Communities[uuid]['timestamp'] = msg.Timestamp
      Communities[uuid]['buildnum'] = 1

      if not Invites[address] then
        Invites[address] = {}
      end
      if not Invites[address][uuid] then
        Invites[address][uuid] = { time = msg.Timestamp }
      end

      local copy = deepCopy(Communities[uuid])
      copy.isJoined = true
      copy.joinTime = msg.Timestamp
      replyData(msg, json.encode(copy))
    end,

    GetCommunities = function(msg)
      local communities = {}

      for uuid, community in pairs(Communities) do
        local copy = deepCopy(community)
        copy.isJoined = false

        local address = msg.Tags.userAddress
        if address and Invites[address] and Invites[address][uuid] then
          copy.isJoined = true
          copy.joinTime = Invites[address][uuid].time
        end
        table.insert(communities, copy)
      end

      replyData(msg, communities)
    end,

    GetCommunity = function(msg)
      local community = deepCopy(Communities[msg.Tags.Uuid])
      local uuid = msg.Tags.Uuid
      if not community then
        return replyError(msg, "Not found.")
      end

      local copy = deepCopy(community)
      copy.isJoined = false

      local address = msg.Tags.userAddress
      if address and Invites[address] and Invites[address][uuid] then
        copy.isJoined = true
        copy.joinTime = Invites[address][uuid].time
      end

      replyData(msg, copy)
    end,
  }
}

for _, actions in pairs(Actions) do
  for name, action in pairs(actions) do
    Handlers.add(
      name,
      name,
      function(msg) action(msg) end
    )
  end
end

-- TODO only update specific field, don't replace the whole Communities[uuid]
-- TODO only whitelisted field can be updated here. uuid/buildNum cannot updated by this Action.
Handlers.add(
  "updateCommunity",
  Handlers.utils.hasMatchingTag("Action", "updateCommunity"),
  function(msg)
    local setting = json.decode(msg.Data)

    if not setting.uuid then
      return replyError(msg, 'uuid is required.')
    end

    local community = Communities[setting.uuid]
    if not community then
      return replyError(msg, 'community not found.')
    end
    if msg.From ~= community.owner then
      return replyError(msg, 'You are not the owner')
    end

    for field, value in pairs(setting) do
      community[field] = value
    end

    local copy = deepCopy(community)
    copy.isJoined = false
    local address = msg.From
    if Invites[address] and Invites[address][uuid] then
      copy.isJoined = true
      copy.joinTime = Invites[address][uuid].time
    end
    replyData(msg, json.encode(copy))
  end
)


Handlers.add(
  "Mute",
  Handlers.utils.hasMatchingTag("Action", "Mute"),
  function(msg)
    local cid = msg.Tags.CommunityUuid
    local community = Communities[cid]
    if not community then
      return replyError(msg, 'Community not found.')
    end

    if msg.From ~= community.owner then
      return replyError(msg, 'You are not the owner.')
    end

    local userAddress = msg.Tags.User
    if userAddress == community.owner then
      return replyError(msg, 'You can not mute the owner.')
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
  end
)

Handlers.add(
  "Unmute",
  Handlers.utils.hasMatchingTag("Action", "Unmute"),
  function(msg)
    local cid = msg.Tags.CommunityUuid
    local community = Communities[cid]
    if not community then
      return replyError(msg, 'Community not found.')
    end

    if msg.From ~= community.owner then
      return replyError(msg, 'You are not the owner.')
    end
    local userAddress = msg.Tags.User

    if MutedUsers[cid] then
      for i, user in ipairs(MutedUsers[cid]) do
        if user == userAddress then
          table.remove(MutedUsers[cid], i)
          break
        end
      end
    end
  end
)

Handlers.add(
  "GetMutedUsers",
  Handlers.utils.hasMatchingTag("Action", "GetMutedUsers"),
  function(msg)
    local uuid = msg.Tags.CommunityUuid
    if not MutedUsers[uuid] then
      return replyData(msg, '[]')
    end
    replyData(msg, MutedUsers[uuid])
  end
)


-- join community
Handlers.add(
  "join",
  Handlers.utils.hasMatchingTag("Action", "join"),
  function(msg)
    local address = msg.From
    local uuid = msg.Data

    local community = Communities[uuid]
    if community then
      if community.buildnum then
        community.buildnum = community.buildnum + 1
      else
        community.buildnum = 1
      end
    end

    if not Invites[address] then
      Invites[address] = {}
    end

    if not Invites[address][uuid] then
      -- TOOD use msg.Timstamp
      Invites[address][uuid] = { invite = msg.Tags.invite, time = msg.Timestamp }
    end
  end
)

Handlers.add(
  "Exit",
  Handlers.utils.hasMatchingTag("Action", "Exit"),
  function(msg)
    local address = msg.From
    local uuid = msg.Tags.Uuid

    local community = Communities[uuid]
    if not community then
      return replyError(msg, 'Community not found.')
    end

    if community.owner == address then
      return replyError(msg, 'You can not exit since you are the owner.')
    end

    if community.buildnum then
      community.buildnum = math.max(0, community.buildnum - 1)
    end

    if not Invites[address] then
      return replyError(msg, "No column named " .. address .. " in Invites")
    end

    if not Invites[address][uuid] then
      return replyError(msg, "Not found related invite info in Invites[" .. address .. "]")
    end

    Invites[address][uuid] = nil
  end
)

Handlers.add(
  "GetUsersByCommunityUUID",
  Handlers.utils.hasMatchingTag("Action", "GetUsersByCommunityUUID"),
  function(msg)
    local uuid = msg.Tags.CommunityUuid
    local communityUsers = {}

    for address, inviteInfo in pairs(Invites) do
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

    replyData(msg, communityUsers)
  end
)

local function registerOrLogin(msg)
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

  replyData(msg, Users[address])
end

Handlers.add(
  "RegisterUserOrLogin",
  Handlers.utils.hasMatchingTag("Action", "RegisterUserOrLogin"),
  registerOrLogin
)

Handlers.add(
  "GetUserByAddress",
  Handlers.utils.hasMatchingTag("Action", "GetUserByAddress"),
  function(msg)
    local userInfo = Users[msg.Tags.Address]
    if not userInfo then
      return replyError(msg, "Not found.")
    end

    replyData(msg, userInfo)
  end
)

-- TODO only update specific field, don't replace the whole Users[address]
Handlers.add(
  "UpdateUser",
  Handlers.utils.hasMatchingTag("Action", "UpdateUser"),
  function(msg)
    local address = msg.From
    -- 检查是否已经存在相同名字的列
    if not Users[address] then
      -- 新建一个以 msg.Id 值为名字的列，并赋值为一个空表
      Users[address] = {}
    end

    Users[address] = json.decode(msg.Data)
  end
)

-- invite info and related user info
Handlers.add(
  "GetInvitesByInviter",
  Handlers.utils.hasMatchingTag("Action", "GetInvitesByInviter"),
  function(msg)
    local invites = {}
    local relatedUsers = {}

    for inviteeAddress, value in pairs(Invites) do
      for communityID, inviteInfo in pairs(value) do
        if inviteInfo.invite == msg.Tags.Inviter then
          local temp = {
            inviterAddress = inviteInfo.invite,
            communityID = communityID,
            inviteeAddress = inviteeAddress,
            time = inviteInfo.time,
          }
          table.insert(invites, temp)

          if not relatedUsers[inviteeAddress] and Users[inviteeAddress] then
            relatedUsers[inviteeAddress] = Users[inviteeAddress]
          end
        end
      end
    end

    local data = {
      invites = invites,
      relatedUsers = relatedUsers
    }

    replyData(msg, data)
  end
)
