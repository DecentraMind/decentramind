Communities = Communities or {}

---@class InviteInfo
---@field invite? string The inviter's address, who invited this user.
---@field time string The timestamp when user join community.


--[[
User's community related data
@type Invites = {
  [address: string]: { -- the user
    [communityID: string]: InviteInfo
  }
}
]]--
Invites = Invites or {}
--[[
type Users = {
  [address: string]: {
    name: string
    avatar: string
  }
}
]]--
Users = Users or {}
GithubCodes = GithubCodes or {}
ChatBans = ChatBans or {}

local json = require("json")

-- Creating new communities
Handlers.add("add", Handlers.utils.hasMatchingTag("Action", "add"), function(msg)
  local testData = json.decode(msg.Data)
  local newColumn = msg.From
  -- Check if a column with the same name already exists
  if not Users[newColumn] then
    -- Create a new column with the msg.Id value as its name and assign it to an empty table
    Users[newColumn] = {}
  end
  for i, item in ipairs(testData) do
    if not Invites[newColumn] then
      -- Create a new column with the msg.Id value as its name and assign it to an empty table
      Invites[newColumn] = {}
    end

    -- Check if uuid exists in usercommunity[newColumn].
    if not Invites[newColumn][item.uuid] then
      -- If the uuid does not exist, add a new entry
      Invites[newColumn][item.uuid] = { invite = msg.Tags.invite, time = msg.Tags.time }
    end
  end
  -- print(encodedData)
  table.insert(Communities, msg.Data)
  Handlers.utils.reply("add")(msg)
end)

-- Find the community column for this uuid
local function findCommunityIndexByUUID(uuid)
  for index, entry in ipairs(Communities) do
    if entry.uuid == uuid then
      return index
    end
  end
  return nil
end

-- Get all communities
Handlers.add("getCommunities", Handlers.utils.hasMatchingTag("Action", "getCommunities"), function(msg)
  local communityCopy = {}
  for _, community in pairs(Communities) do
    community.isJoined = false
    if Invites[msg.Tags.userAddress] then
      if Invites[msg.Tags.userAddress][community.uuid] then
        community.isJoined = true
        community.joinTime = Invites[msg.Tags.userAddress][community.uuid].time
      end
    end
    table.insert(communityCopy, community)
  end

  Handlers.utils.reply(json.encode(communityCopy))(msg)
end)

Handlers.add("getCommunity", Handlers.utils.hasMatchingTag("Action", "getCommunity"), function(msg)
  local index = findCommunityIndexByUUID(msg.Tags.uuid)
  if not index then
    print("Not found.")
    return
  end
  Handlers.utils.reply(json.encode(Communities[index]))(msg)
end)

Handlers.add("updateCommunity", Handlers.utils.hasMatchingTag("Action", "updateCommunity"), function(msg)
  local setting = json.decode(msg.Data)
  local index = findCommunityIndexByUUID(setting.uuid)
  if index then
    -- Ensure modifiers are community owners
    if Communities[index].creater == msg.From then
      Communities[index] = setting
      Handlers.utils.reply(Communities[index])(msg)
    else
      print("You are not the creater of this community.")
    end
  else
    print("Not found.")
  end
end)

-- clear all logo and avatar
-- Handlers.add('clearImages', Handlers.utils.hasMatchingTag("Action", "communitysetting"), function(msg)
--   local communityID = msg.Tags.communityID
--   local communityIndex = findCommunityIndexByUUID(community, communityID)

--   -- Find the column in community that matches testDataUUID
--   if communityIndex then
--     -- Replace the logo in this column with msg.Data
--     community[communityIndex].logo = msg.Data
--   else
--     print("Community not found")
--   end

--   Handlers.utils.reply()(msg)
-- end)


-- Modifying Community Information
Handlers.add("chatban", Handlers.utils.hasMatchingTag("Action", "chatban"), function(msg)
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
end)

-- Modifying Community Information
Handlers.add("unchatban", Handlers.utils.hasMatchingTag("Action", "unchatban"), function(msg)
  if ChatBans[msg.Tags.community] then
    for i, user in ipairs(ChatBans[msg.Tags.community]) do
      if user == msg.Tags.user then
        table.remove(ChatBans[msg.Tags.community], i)
        break
      end
    end
  end

  Handlers.utils.reply("unchatban")(msg)
end)

-- Modifying Community Information
Handlers.add("getchatban", Handlers.utils.hasMatchingTag("Action", "getchatban"), function(msg)
  Handlers.utils.reply(json.encode(ChatBans))(msg)
end)


-- join community
Handlers.add("join", Handlers.utils.hasMatchingTag("Action", "join"), function(msg)
  local newColumn = msg.From
  local uuid = msg.Data
  -- Check if a column with the same name already exists
  for key, community in pairs(Communities) do
    if community and community.uuid == uuid then
      if community.buildnum then
        community.buildnum = community.buildnum + 1
      end
      Communities[key] = community
      break
    end
  end

  if not Invites[newColumn] then
    Invites[newColumn] = {}
  end

  -- Check if uuid exists in usercommunity[newColumn].
  if not Invites[newColumn][uuid] then
    -- If the uuid does not exist, add a new entry
    Invites[newColumn][uuid] = { invite = msg.Tags.invite, time = msg.Tags.time }
  end

end)

-- exit community
Handlers.add("exit", Handlers.utils.hasMatchingTag("Action", "exit"), function(msg)
  local newColumn = msg.From
  print(msg.Tags.userAddress)

  if Communities then
    for key, community in pairs(Communities) do
      if community and community.uuid == msg.Data then
        if community.buildnum then
          community.buildnum = community.buildnum - 1
          if community.buildnum <= 0 then
            community.buildnum = 0
          end
          Communities[key] = community
          break
        end
      end
    end
  else
    print("community is nil or not a table")
  end

  -- Check for the presence of usercommunity[newColumn]
  if Invites[newColumn] then
    -- Check for the presence of usercommunity[newColumn].joined
    if Invites[newColumn][msg.Data] then
      -- 遍历 usercommunity[newColumn].joined
      Invites[newColumn][msg.Data] = nil
    else
      print("No 'joined' field in usercommunity[" .. newColumn .. "]")
    end
  else
    print("No column named " .. newColumn .. " in usercommunity")
  end
end)

-- 获取指定社区中加入得用户
Handlers.add("communityuser", Handlers.utils.hasMatchingTag("Action", "communityuser"), function(msg)
  --print(usercommunity)
  -- 目标 uuid 从消息中获取，例如 msg.Tags.uuid
  local target_uuid = msg.Tags.uuid
  print(target_uuid)
  -- 用于存储找到的键的表
  local matching_keys = {}

  -- 遍历 usercommunity 表
  for key, value in pairs(Invites) do
    -- 遍历 joined 列表，查看当前用户加入得社区列
    for subkey, subvalue in pairs(value) do
      -- 访问 invite 参数，如果他加入得社区中有指定得uuid
      if subkey == target_uuid then
        -- table.insert(matching_keys, key)
        -- 加入过这个社区得用户，获取他userinfo中的用户名和头像
        for info_key, info_value in pairs(Users) do
          if info_key == key then
            matching_keys[info_key] = info_value
            print('goods')
            print(info_value)
          end
        end
      end
    end
  end
  --print(matching_keys)
  cJson = json.encode(matching_keys)
  Handlers.utils.reply(cJson)(msg)
end)


Handlers.add("registerUser", Handlers.utils.hasMatchingTag("Action", "registerUser"), function(msg)
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
end)

Handlers.add("getUser", Handlers.utils.hasMatchingTag("Action", "getUser"), function(msg)
  -- 检查 userinfo 中是否存在指定用户
  local userInfo = Users[msg.Tags.userAddress]
  if not userInfo then
    print("Not found.")
    return
  end

  Handlers.utils.reply(json.encode(userInfo))(msg)
end)

--获取github code
Handlers.add("getGithubcode", Handlers.utils.hasMatchingTag("Action", "getGithubcode"), function(msg)
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
end)

-- 个人信息修改
Handlers.add("updateUser", Handlers.utils.hasMatchingTag("Action", "updateUser"), function(msg)
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
end)

-- invite info and related user info
Handlers.add("getAllInviteInfo", Handlers.utils.hasMatchingTag("Action", "getAllInviteInfo"), function(msg)
  local invites = {}
  local relatedUsers = {}

  for inviteeAddress, value in pairs(Invites) do
    for communityID, subvalue in pairs(value) do
      local temp = {
        inviterAddress = subvalue.invite,   -- inviter
        communityID = communityID,
        inviteeAddress = inviteeAddress,    -- invitee address
        time = subvalue.time,
      }
      table.insert(invites, temp)

      if not relatedUsers[inviteeAddress] then
        relatedUsers[inviteeAddress] = {}
      end
    end
  end

  for address, user in pairs(Users) do
    if (relatedUsers[address]) then
      relatedUsers[address] = user and user or {}
    end
  end

  local data = {
    invites = invites,
    relatedUsers = relatedUsers
  }

Handlers.utils.reply(json.encode(data))(msg)
end)
