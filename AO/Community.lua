Name = 'DecentraMind Community Manager'
Variant = '0.2.3'

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
---@field invite? string The inviter's address, who invited this user.
---@field time number The timestamp when user join community.


--- User's community related data
---@type table<string, table<string, InviteInfo>>
---{
---  [address: string]: { -- the user
---    [communityID: string]: InviteInfo
---  }
-- }
Invites = Invites or {}
--[[
type Users = {
  [address: string]: {
    name: string
    avatar: string
  }
}
]] --
Users = Users or {}
GithubCodes = GithubCodes or {}

--- @type table<string, string[]> table of community's muted user addresses
MutedUsers = MutedUsers or {}

local json = require("json")

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
  local action = request.Action .. "-Error"
  local errString = errorMsg
  if type(errorMsg) ~= "string" then
    errString = json.encode(errorMsg)
  end

  ao.send({ Target = request.From, Action = action, ["Message-Id"] = request.Id, Error = errString })
end

-- Creating new communities
Handlers.add(
  "create",
  Handlers.utils.hasMatchingTag("Action", "createCommunity"),
  function(msg)
    local community = json.decode(msg.Data)
    local address = msg.From
    -- Check if a column with the same name already exists
    if not Users[address] then
      -- Create a new column with the msg.Id value as its name and assign it to an empty table
      Users[address] = {}
    end

    local uuid = createUuid()

    if Communities[uuid] then
      replyError(msg, 'uuid existed.')
      return
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

    Handlers.utils.reply(json.encode(Communities[uuid]))(msg)
  end
)

-- Get all communities
Handlers.add(
  "GetCommunities",
  Handlers.utils.hasMatchingTag("Action", "GetCommunities"),
  function(msg)
    local communityCopy = {}

    for uuid, community in pairs(Communities) do
      local copy = deepCopy(community)
      copy.isJoined = false

      local address = msg.Tags.userAddress
      if address and Invites[address] then
        if Invites[address][uuid] then
          copy.isJoined = true
          copy.joinTime = Invites[address][uuid].time
        end
      end
      table.insert(communityCopy, copy)
    end

    Handlers.utils.reply(json.encode(communityCopy))(msg)
  end
)

Handlers.add(
  "GetCommunity",
  Handlers.utils.hasMatchingTag("Action", "GetCommunity"),
  function(msg)
    local community = deepCopy(Communities[msg.Tags.uuid])
    local uuid = msg.Tags.uuid
    if not community then
      return replyError(msg, "Not found.")
    end

    local copy = deepCopy(community)
    copy.isJoined = false

    local address = msg.Tags.userAddress
    if address and Invites[address] then
      if Invites[address][uuid] then
        copy.isJoined = true
        copy.joinTime = Invites[address][uuid].time
      end
    end
    Handlers.utils.reply(json.encode(copy))(msg)
  end
)

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
    Handlers.utils.reply(json.encode(community))(msg)
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

    Handlers.utils.reply("unchatban")(msg)
  end
)

Handlers.add(
  "GetMutedUsers",
  Handlers.utils.hasMatchingTag("Action", "GetMutedUsers"),
  function(msg)
    local uuid = msg.Tags.CommunityUuid
    if not MutedUsers[uuid] then
      return Handlers.utils.reply('[]')(msg)
    end
    Handlers.utils.reply(json.encode(MutedUsers[uuid]))(msg)
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

    Handlers.utils.reply(json.encode(communityUsers))(msg)
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

  Handlers.utils.reply(json.encode(Users[address]))(msg)
end

Handlers.add(
  "registerUserOrLogin",
  Handlers.utils.hasMatchingTag("Action", "registerUserOrLogin"),
  registerOrLogin
)

Handlers.add(
  "getUser",
  Handlers.utils.hasMatchingTag("Action", "getUser"),
  function(msg)
    -- 检查 userinfo 中是否存在指定用户
    local userInfo = Users[msg.Tags.userAddress]
    if not userInfo then
      print("Not found.")
      return
    end

    Handlers.utils.reply(json.encode(userInfo))(msg)
  end
)

--获取github code
Handlers.add(
  "getGithubcode",
  Handlers.utils.hasMatchingTag("Action", "getGithubcode"),
  function(msg)
    local address = msg.Tags.userAddress
    print("-----")
    if GithubCodes[address] then
      local value = GithubCodes[address]
      print("Value for key " .. value)
      Handlers.utils.reply(value)(msg)
    else
      local result = 'N/A'
      print("Key not found")
      Handlers.utils.reply(result)(msg)
    end
  end
)

-- TODO only update specific field, don't replace the whole Users[address]
Handlers.add(
  "updateUser",
  Handlers.utils.hasMatchingTag("Action", "updateUser"),
  function(msg)
    local address = msg.From
    -- 检查是否已经存在相同名字的列
    if not Users[address] then
      -- 新建一个以 msg.Id 值为名字的列，并赋值为一个空表
      Users[address] = {}
    end

    Users[address] = json.decode(msg.Data)

    -- 判断msg.Tags.github是否存在并且等于"yes"
    if msg.Tags.github and msg.Tags.github == "yes" then
      -- 检查githubcode中是否存在key值为msg.From的列
      if not GithubCodes[address] then
        -- 生成一串10位数字的字符串
        local randomString = ""
        for i = 1, 10 do
          randomString = randomString .. tostring(math.random(0, 9))
        end

        -- 将生成的字符串赋值给githubcode的这一列
        print(randomString)
        print("------------")
        GithubCodes[address] = randomString
        Handlers.utils.reply(randomString)(msg)
      end
    end
  end
)

-- invite info and related user info
Handlers.add(
  "getInvitesByInviter",
  Handlers.utils.hasMatchingTag("Action", "getInvitesByInviter"),
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

    Handlers.utils.reply(json.encode(data))(msg)
  end
)
