---@class Community
---@field logo string arweave hash of logo
---@field bounty string[] bounty token names
---@field communitychatid string process ID of chatroom
---@field banner string banner name or arwaeve hash of banner
---@field support
---@field creater string
---@field timestamp number
---@field communitytoken
---@field tokensupply
---@field buildnum string
---@field ispublished boolean
---@field name string
---@field desc string introduction

--[[
All Communities
@type Communities = {
  [uuid: string]: Community
}
]] --
Communities = Communities or {}

---@class InviteInfo
---@field invite? string The inviter's address, who invited this user.
---@field time number The timestamp when user join community.

--[[
User's community related data
@type Invites = {
  [address: string]: { -- the user
    [communityID: string]: InviteInfo
  }
}
]] --
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
ChatBans = ChatBans or {}

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

-- Creating new communities
-- TODO generate uuid in AO side
-- TODO reset buildnum to initial value
Handlers.add(
  "add",
  Handlers.utils.hasMatchingTag("Action", "add"),
  function(msg)
    local community = json.decode(msg.Data)
    local address = msg.From
    -- Check if a column with the same name already exists
    if not Users[address] then
      -- Create a new column with the msg.Id value as its name and assign it to an empty table
      Users[address] = {}
    end

    if not Communities[community.uuid] then
      Communities[community.uuid] = community
    else
      print('uuid existed.')
      return
    end

    if not Invites[address] then
      Invites[address] = {}
    end
    if not Invites[address][community.uuid] then
      Invites[address][community.uuid] = { invite = msg.Tags.invite, time = msg.Timestamp }
    end

    Handlers.utils.reply(Communities[community.uuid])(msg)
  end
)

-- Get all communities
Handlers.add(
  "getCommunities",
  Handlers.utils.hasMatchingTag("Action", "getCommunities"),
  function(msg)
    local communityCopy = {}
    for uuid, community in pairs(Communities) do
      local copy = deepCopy(community)
      copy.uuid = uuid
      copy.isJoined = false
      if Invites[msg.Tags.userAddress] then
        if Invites[msg.Tags.userAddress][uuid] then
          copy.isJoined = true
          copy.joinTime = Invites[msg.Tags.userAddress][uuid].time
        end
      end
      table.insert(communityCopy, copy)
    end

    Handlers.utils.reply(json.encode(communityCopy))(msg)
  end
)

Handlers.add(
  "getCommunity",
  Handlers.utils.hasMatchingTag("Action", "getCommunity"),
  function(msg)
    local community = deepCopy(Communities[msg.Tags.uuid])
    community.uuid = msg.Tags.uuid
    if not community then
      print("Not found.")
      return
    end
    Handlers.utils.reply(json.encode(community))(msg)
  end
)

-- TODO only update specific field, don't replace the whole Communities[uuid]
Handlers.add(
  "updateCommunity",
  Handlers.utils.hasMatchingTag("Action", "updateCommunity"),
  function(msg)
    local setting = json.decode(msg.Data)
    local community = Communities[msg.Tags.uuid]
    if community then
      -- Ensure modifiers are community owners
      if community.creater == msg.From then
        for field, value in pairs(setting) do
          community[field] = value
        end
        Handlers.utils.reply(community)(msg)
      else
        print("You are not the creater of this community.")
      end
    else
      print("Not found.")
    end
  end
)


Handlers.add(
  "chatban",
  Handlers.utils.hasMatchingTag("Action", "chatban"),
  function(msg)
    ChatBans[msg.Tags.community] = ChatBans[msg.Tags.community] or {}

    local userExists = false
    for _, user in ipairs(ChatBans[msg.Tags.community]) do
      if user == msg.Tags.user then
        userExists = true
        break
      end
    end

    if not userExists then
      table.insert(ChatBans[msg.Tags.community], msg.Tags.user)
      print("User " .. msg.Tags.user .. " has been added to the chat ban list for community " .. msg.Tags.community)
    else
      print("User " .. msg.Tags.user .. " is already in the chat ban list for community " .. msg.Tags.community)
    end

    Handlers.utils.reply("chatban")(msg)
  end
)

Handlers.add(
  "unchatban",
  Handlers.utils.hasMatchingTag("Action", "unchatban"),
  function(msg)
    if ChatBans[msg.Tags.community] then
      for i, user in ipairs(ChatBans[msg.Tags.community]) do
        if user == msg.Tags.user then
          table.remove(ChatBans[msg.Tags.community], i)
          break
        end
      end
    end

    Handlers.utils.reply("unchatban")(msg)
  end
)

Handlers.add(
  "getchatban",
  Handlers.utils.hasMatchingTag("Action", "getchatban"),
  function(msg)
    Handlers.utils.reply(json.encode(ChatBans))(msg)
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

-- exit community
Handlers.add(
  "exit",
  Handlers.utils.hasMatchingTag("Action", "exit"),
  function(msg)
    local address = msg.From
    local communityID = msg.Data

    local community = Communities[communityID]
    if community then
      if community.buildnum then
        community.buildnum = math.max(0, community.buildnum - 1)
      end
    else
      print('Community not found.')
      return
    end

    if Invites[address] then
      if Invites[address][communityID] then
        Invites[address][communityID] = nil
      else
        print("Not found related invite info in Invites[" .. address .. "]")
      end
    else
      print("No column named " .. address .. " in Invites")
    end
  end
)

-- TODO rename this to getUsersByCommunityUUID
Handlers.add(
  "communityuser",
  Handlers.utils.hasMatchingTag("Action", "communityuser"),
  function(msg)
    local uuid = msg.Tags.uuid
    local communityUsers = {}

    for address, inviteInfo in pairs(Invites) do
      if inviteInfo[uuid] then
        communityUsers[address] = Users[address]
      end
    end

    Handlers.utils.reply(json.encode(communityUsers))(msg)
  end
)


Handlers.add(
  "registerUser",
  Handlers.utils.hasMatchingTag("Action", "registerUser"),
  function(msg)
    local address = msg.From
    local avatar = msg.Tags.Avatar
    local name = msg.Tags.UserName
    local user = {
      avatar = avatar,
      name = name
    }
    if not Users[address] then
      Users[address] = user
    else
      print('User existed.')
    end
  end
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
  "getAllInviteInfo",
  Handlers.utils.hasMatchingTag("Action", "getAllInviteInfo"),
  function(msg)
    local invites = {}
    local relatedUsers = {}

    for inviteeAddress, value in pairs(Invites) do
      for communityID, inviteInfo in pairs(value) do
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

    local data = {
      invites = invites,
      relatedUsers = relatedUsers
    }

    Handlers.utils.reply(json.encode(data))(msg)
  end
)
