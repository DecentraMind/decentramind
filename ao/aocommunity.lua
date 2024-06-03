community = community or {}
usercommunity = usercommunity or {}
userinfo = userinfo or {}


local json = require("json")

-- 创建新的社区
Handlers.add("add", Handlers.utils.hasMatchingTag("Action", "add"), function(msg)
  local testData = json.decode(msg.Data)
  local newColumn = msg.Tags.userAddress
  print(testData)
  -- 检查是否已经存在相同名字的列
  if not userinfo[newColumn] then
    -- 新建一个以 msg.Id 值为名字的列，并赋值为一个空表
    userinfo[newColumn] = {}
  end
  for i, item in ipairs(testData) do
    if not usercommunity[newColumn] then
      -- 新建一个以 msg.Id 值为名字的列，并赋值为一个空表
      usercommunity[newColumn] = {}
    end

    -- 检查 usercommunity[newColumn] 是否存在 uuid
    if not usercommunity[newColumn][item.uuid] then
      -- 如果不存在 uuid，则添加新条目
      usercommunity[newColumn][item.uuid] = { invite = msg.Tags.invite, time = msg.Tags.time }
    end
  end
  -- print(encodedData)
  table.insert(community, msg.Data)

  print("add success")
  Handlers.utils.reply("add")(msg)
end)

-- 查找刀这个uuid的社区列
local function findCommunityIndexByUUID(community, uuid)
  print("--------")
  print(uuid)
  for index, entry in ipairs(community) do
    print("111")
    local dCom = json.decode(entry)
    print(dCom[1].uuid)
    if dCom[1].uuid == uuid then
      print("--------", entry)
      return index
    end
  end
  return nil
end

-- 修改社区信息
Handlers.add("communitysetting", Handlers.utils.hasMatchingTag("Action", "communitysetting"), function(msg)
  local testData = json.decode(msg.Data)
  local newColumn = msg.Tags.userAddress
  -- 找到 testData 的 uuid
  local testDataUUID = testData[1].uuid
  -- 找到 community 中与 testDataUUID 匹配的列
  local communityIndex = findCommunityIndexByUUID(community, testDataUUID)

  -- 如果找到匹配的列
  if communityIndex then
    -- 替换该列的数据为 testData 中对应的数据
    community[communityIndex] = msg.Data
  else
    -- 如果未找到匹配的列，则将 testData 添加到 community 中
    -- table.insert(community, testData[1])
    print("目标社区为空")
  end
  -- table.insert(community, msg.Data)

  print("setting change success")
  Handlers.utils.reply("communitysetting")(msg)
end)

-- 加入社区方法
Handlers.add("join", Handlers.utils.hasMatchingTag("Action", "join"), function(msg)
  local newColumn = msg.Tags.userAddress
  local uuid = msg.Data
  print(msg.Tags.userAddress)
  -- 检查是否已经存在相同名字的列
  if not usercommunity[newColumn] then
    -- 新建一个以 msg.Id 值为名字的列，并赋值为一个空表
    usercommunity[newColumn] = {}
  end

  -- 检查 usercommunity[newColumn] 是否存在 uuid
  if not usercommunity[newColumn][uuid] then
    -- 如果不存在 uuid，则添加新条目
    usercommunity[newColumn][uuid] = { invite = msg.Tags.invite, time = msg.Tags.time }
  end

  --[[
  -- 检查是否已经存在 joined 字段
  if usercommunity[newColumn].joined then
    -- 如果 joined 字段已存在，则在其末尾追加 "xDao"
    local isDuplicate = false -- 标志位，表示是否存在重复数据

    -- 遍历 usercommunity[newColumn].joined
    for _, data in ipairs(usercommunity[newColumn].joined) do
      if data == msg.Data then
        print("joined--")
        isDuplicate = true
        break -- 如果找到重复数据，则跳出循环
      end
    end

    if not isDuplicate then
      -- 如果 joined 字段已存在且没有重复数据，则在其末尾追加 "xDao"
      table.insert(usercommunity[newColumn].joined, msg.Data)
    end
  else
    -- 如果 joined 字段不存在，则新建一个 joined 字段，并赋值为包含 "xDao" 的数组
    usercommunity[newColumn].joined = { msg.Data }
  end
  ]]
end)

-- 退出社区的方法
Handlers.add("exit", Handlers.utils.hasMatchingTag("Action", "exit"), function(msg)
  local newColumn = msg.Tags.userAddress
  print(msg.Tags.userAddress)

  -- 检查是否存在 usercommunity[newColumn]
  if usercommunity[newColumn] then
    -- 检查是否存在 usercommunity[newColumn].joined
    if usercommunity[newColumn][msg.Data] then
      -- 遍历 usercommunity[newColumn].joined
      usercommunity[newColumn][msg.Data] = nil
    else
      print("No 'joined' field in usercommunity[" .. newColumn .. "]")
    end
  else
    print("No column named " .. newColumn .. " in usercommunity")
  end
end)

-- 获取所有社区信息
Handlers.add("communitylist", Handlers.utils.hasMatchingTag("Action", "communitylist"), function(msg)
  -- 创建 communityCopy 数组
  print("goods")
  local communityCopy = {}
  for _, communityItem in ipairs(community) do
    local dCom = json.decode(communityItem)
    -- local dCom = communityItem
    local itemCopy = {
      uuid = dCom[1].uuid,
      logo = dCom[1].logo,
      banner = dCom[1].banner,
      name = dCom[1].name,
      desc = dCom[1].desc,
      website = dCom[1].website,
      showwebsite = dCom[1].showwebsite,
      twitter = dCom[1].twitter,
      showtwitter = dCom[1].showtwitter,
      whitebook = dCom[1].whitebook,
      showwhitebook = dCom[1].showwhitebook,
      github = dCom[1].github,
      showgithub = dCom[1].showgithub,
      buildnum = dCom[1].buildnum,
      showbuildnum = dCom[1].showbuildnum,
      showallreward = dCom[1].showallreward,
      bounty = dCom[1].bounty,
      showbounty = dCom[1].showbounty,
      showdetail = dCom[1].showdetail,
      ispublished = dCom[1].ispublished,
      communitytoken = dCom[1].communitytoken,
      istradable = dCom[1].istradable,
      support = dCom[1].support,
      showalltoken = dCom[1].showalltoken,
      alltoken = dCom[1].alltoken,
      tokensupply = dCom[1].tokensupply,
      creater = dCom[1].creater,
      communitychatid = dCom[1].communitychatid,
      timestamp = dCom[1].timestamp
    }
    itemCopy.isJoined = false -- 默认 isJoined 为 false
    print("---------------ggg", dCom[1].creater)
    print(dCom[1].creater)
    if usercommunity[msg.Tags.userAddress] then
      if usercommunity[msg.Tags.userAddress][dCom[1].uuid] then
        itemCopy.isJoined = true -- 如果 community 数组中的某个项目在 usercommunity 中存在，则将 isJoined 设为 true
      end
    end
    table.insert(communityCopy, itemCopy) -- 将复制后的项目添加到 communityCopy 数组中
  end

  -- print(communityCopy)
  -- 需要将table转成json字符串传回
  local cJson = json.encode(communityCopy)
  Handlers.utils.reply(cJson)(msg)
end)

-- 获取指定社区中加入得用户
Handlers.add("communityuser", Handlers.utils.hasMatchingTag("Action", "communityuser"), function(msg)
  --print(usercommunity)
  -- 目标 uuid 从消息中获取，例如 msg.Tags.uuid
  local target_uuid = msg.Tags.uuid

  -- 用于存储找到的键的表
  local matching_keys = {}

  -- 遍历 usercommunity 表
  for key, value in pairs(usercommunity) do
    -- 遍历 joined 列表
    print(usercommunity)
    for subkey, subvalue in pairs(value) do
      -- 访问 invite 参数

      if subkey == target_uuid then
        print("gooods")
        table.insert(matching_keys, key)
      end
    end
  end
  --print(matching_keys)
  cJson = json.encode(matching_keys)
  Handlers.utils.reply(cJson)(msg)
end)

-- 获取指定社区的信息
Handlers.add("communityInfo", Handlers.utils.hasMatchingTag("Action", "communityInfo"), function(msg)
  -- 创建 communityCopy 数组
  local communityCopy = {}
  for _, communityItem in ipairs(community) do
    local dCom = json.decode(communityItem)
    print(dCom[1].uuid)
    if msg.Tags.uuid == dCom[1].uuid then
      local itemCopy = {
        uuid = dCom[1].uuid,
        logo = dCom[1].logo,
        banner = dCom[1].banner,
        name = dCom[1].name,
        desc = dCom[1].desc,
        website = dCom[1].website,
        showwebsite = dCom[1].showwebsite,
        twitter = dCom[1].twitter,
        showtwitter = dCom[1].showtwitter,
        whitebook = dCom[1].whitebook,
        showwhitebook = dCom[1].showwhitebook,
        github = dCom[1].github,
        showgithub = dCom[1].showgithub,
        buildnum = dCom[1].buildnum,
        showbuildnum = dCom[1].showbuildnum,
        showallreward = dCom[1].showallreward,
        bounty = dCom[1].bounty,
        showbounty = dCom[1].showbounty,
        showdetail = dCom[1].showdetail,
        ispublished = dCom[1].ispublished,
        communitytoken = dCom[1].communitytoken,
        istradable = dCom[1].istradable,
        support = dCom[1].support,
        showalltoken = dCom[1].showalltoken,
        alltoken = dCom[1].alltoken,
        tokensupply = dCom[1].tokensupply,
        creater = dCom[1].creater
      }
      table.insert(communityCopy, itemCopy) -- 将复制后的项目添加到 communityCopy 数组中
    end
  end
  -- 需要将table转成json字符串传回
  local cJson = json.encode(communityCopy)
  Handlers.utils.reply(cJson)(msg)
end)

-- 获取已加入得社区列表信息
Handlers.add("communitylistjoined", Handlers.utils.hasMatchingTag("Action", "communitylistjoined"), function(msg)
  -- 创建 communityCopy 数组
  local communityCopy = {}
  for _, communityItem in ipairs(community) do
    local dCom = json.decode(communityItem)
    if userinfo[msg.Tags.userAddress] and type(userinfo[msg.Tags.userAddress]) == "table" then
      for _, userinfoItem in ipairs(userinfo[msg.Tags.userAddress].joined) do
        if dCom[1].uuid == userinfoItem then
          print("goods")
          local itemCopy = {
            uuid = dCom[1].uuid,
            logo = dCom[1].logo,
            banner = dCom[1].banner,
            name = dCom[1].name,
            desc = dCom[1].desc,
            website = dCom[1].website,
            showwebsite = dCom[1].showwebsite,
            twitter = dCom[1].twitter,
            showtwitter = dCom[1].showtwitter,
            whitebook = dCom[1].whitebook,
            showwhitebook = dCom[1].showwhitebook,
            github = dCom[1].github,
            showgithub = dCom[1].showgithub,
            buildnum = dCom[1].buildnum,
            showbuildnum = dCom[1].showbuildnum,
            showallreward = dCom[1].showallreward,
            bounty = dCom[1].bounty,
            showbounty = dCom[1].showbounty,
            showdetail = dCom[1].showdetail,
            ispublished = dCom[1].ispublished,
            communitytoken = dCom[1].communitytoken,
            istradable = dCom[1].istradable,
            support = dCom[1].support,
            showalltoken = dCom[1].showalltoken,
            alltoken = dCom[1].alltoken,
            tokensupply = dCom[1].tokensupply
          }
          table.insert(communityCopy, itemCopy) -- 将复制后的项目添加到 communityCopy 数组中
          break
        end
      end
    end
  end
  -- 需要将table转成json字符串传回
  local cJson = json.encode(communityCopy)
  Handlers.utils.reply(cJson)(msg)
end)

-- 获取个人信息
Handlers.add("getInfo", Handlers.utils.hasMatchingTag("Action", "getInfo"), function(msg)
  local tempInfo = {}
  print("gooods")
  -- 检查 userinfo 中是否存在指定用户
  local userInfo = userinfo[msg.Tags.userAddress]
  if userInfo then
    -- 将用户信息添加到临时表
    tempInfo.avatar = userInfo.avatar or "N/A"
    tempInfo.username = userInfo.username or "N/A"
    tempInfo.twitter = userInfo.twitter or "N/A"
    tempInfo.showtwitter = userInfo.showtwitter or true
    tempInfo.mail = userInfo.mail or "N/A"
    tempInfo.showmail = userInfo.showmail or true
    tempInfo.phone = userInfo.phone or "N/A"
    tempInfo.showphone = userInfo.showphone or true
  else
    -- 用户信息不存在时，设置默认值
    tempInfo.avatar = "N/A"
    tempInfo.username = "N/A"
    tempInfo.twitter = "N/A"
    tempInfo.showtwitter = true
    tempInfo.mail = "N/A"
    tempInfo.showmail = true
    tempInfo.phone = "N/A"
    tempInfo.showphone = true
  end
  print(userinfo[msg.Tags.userAddress])
  -- 需要将table转成json字符串传回
  local iJson = json.encode(tempInfo)

  Handlers.utils.reply(userinfo[msg.Tags.userAddress])(msg)
end)

-- 个人信息修改
Handlers.add("personalInfo", Handlers.utils.hasMatchingTag("Action", "personalInfo"), function(msg)
  local newColumn = msg.Tags.userAddress
  print("goods")
  -- 检查是否已经存在相同名字的列
  if not userinfo[newColumn] then
    -- 新建一个以 msg.Id 值为名字的列，并赋值为一个空表
    userinfo[newColumn] = {}
  end

  userinfo[newColumn] = msg.Data
end)

-- 注册个人信息
Handlers.add("registInfo", Handlers.utils.hasMatchingTag("Action", "registInfo"), function(msg)
  print("goods")
  local newColum = msg.Tags.userAddress
  if not userinfo[newColum] then
    userinfo[newColum] = {}
    userinfo[newColum].avatar = "N/A"
    userinfo[newColum].name = "N/A"
    userinfo[newColum].twitter = "N/A"
    userinfo[newColum].twitter = true
    userinfo[newColum].mail = "N/A"
    userinfo[newColum].showmail = true
    userinfo[newColum].phone = "N/A"
    userinfo[newColum].showphone = true
    userinfo[newColum].joined = {}
  end
end)

-- handlers方法测试功能，用来测试这里得方法以及查看表内容等等。。
Handlers.add("handlersTest", Handlers.utils.hasMatchingTag("Action", "handlersTest"), function(msg)
  --local pretty = require(".pretty")

  --local formatted = pretty.tprint(community, 2)

  -- prints the formatted table structure
  --for _, i in pairs(formatted) do
  --  print(i)
  --end

  for k, _ in pairs(community) do
    print()
    community[k] = nil
  end

  -- for k, _ in pairs(userinfo) do
  --    userinfo[k] = nil
  -- end
end)

------- fizi任务的方法
Handlers.add("CreateTask", Handlers.utils.hasMatchingTag("Action", "CreateTask"), function(msg)
  table.insert(TasksForTable, msg.Data)
  Handlers.utils.reply("created task by new method.")(msg)
end)

Handlers.add("GetAllTasks", Handlers.utils.hasMatchingTag("Action", "GetAllTasks"), function(msg)
  Handlers.utils.reply(table.concat(TasksForTable, ";"))(msg)
end)

Handlers.add("DeleteLastTask", Handlers.utils.hasMatchingTag("Action", "DeleteLastTask"), function(msg)
  table.remove(TasksForTable)
  Handlers.utils.reply("The last task has been deleted.")(msg)
end)

Handlers.add("JoinSpaceTask", Handlers.utils.hasMatchingTag("Action", "JoinSpaceTask"), function(msg)
  -- 解析传过来的参数，找到对应任务，修改任务已提交场次参数
  local req = json.decode(msg.Data)

  local taskId = req.taskId
  for key, value in pairs(TasksForTable) do
    local v = json.decode(value)
    if (v.taskId == taskId) then
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
end)

Handlers.add("GetJoinInfoByTaskId", Handlers.utils.hasMatchingTag("Action", "GetJoinInfoByTaskId"), function(msg)
  -- 通过id获取该任务对应参与信息
  local resp = {}
  local taskId = msg.Data
  for key, value in pairs(SpaceTaskJoinedTable) do
    local v = json.decode(value)
    if (v.taskId == taskId) then
      table.insert(resp, value)
    end
  end
  Handlers.utils.reply(table.concat(resp, ";"))(msg)
end)
