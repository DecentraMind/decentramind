community = community or {}
usercommunity = usercommunity or {}

local json = require("json")

-- 创建新的社区
Handlers.add("add", Handlers.utils.hasMatchingTag("Action", "add"), function(msg)
    print("test it")
    print(msg)
    print(msg.Data)
    local testData = json.decode(msg.Data)
    print(testData)
    for i, item in ipairs(testData) do
        table.insert(usercommunity, item.name)
    end
    print(encodedData)
    table.insert(community, msg.Data)

    print("add success")
    Handlers.utils.reply("add")(msg)
end)

-- 加入社区方法
Handlers.add("join", Handlers.utils.hasMatchingTag("Action", "join"), function(msg)
    print(cJson)
    local newColumn = msg.Tags.userAddress
    print(msg.Tags.userAddress)
    -- 检查是否已经存在相同名字的列
    if not usercommunity[newColumn] then
        -- 新建一个以 msg.Id 值为名字的列，并赋值为一个空表
        usercommunity[newColumn] = {}
    end

    -- 检查是否已经存在 joined 字段
    if usercommunity[newColumn].joined then
        -- 如果 joined 字段已存在，则在其末尾追加 "xDao"
        table.insert(usercommunity[newColumn].joined, msg.Data)
    else
        -- 如果 joined 字段不存在，则新建一个 joined 字段，并赋值为包含 "xDao" 的数组
        usercommunity[newColumn].joined = { msg.Data }
    end
end)

-- 获取所有社区信息
Handlers.add("communitylist", Handlers.utils.hasMatchingTag("Action", "communitylist"), function(msg)
    -- 创建 communityCopy 数组
    local communityCopy = {}
    for _, communityItem in ipairs(community) do
        local dCom = json.decode(communityItem)
        local itemCopy = {
            uuid = dCom[1].uuid,
            name = dCom[1].name,
            desc = dCom[1].desc,
            website = dCom[1].website,
            whitebook = dCom[1].whitebook,
            allreward = dCom[1].allreward
        }
        itemCopy.isJoined = false -- 默认 isJoined 为 false
        if usercommunity[msg.Tags.userAddress] and type(usercommunity[msg.Tags.userAddress]) == "table" then
            for _, userCommunityItem in ipairs(usercommunity[msg.Tags.userAddress].joined) do
                print(userCommunityItem)
                print(dCom[1].name)
                print("---")
                if dCom[1].name == userCommunityItem then
                    itemCopy.isJoined = true -- 如果 community 数组中的某个项目在 usercommunity 中存在，则将 isJoined 设为 true
                    break
                end
            end
        end
        table.insert(communityCopy, itemCopy) -- 将复制后的项目添加到 communityCopy 数组中
    end
    print(communityCopy)
    -- 需要将table转成json字符串传回
    local cJson = json.encode(communityCopy)
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
                name = dCom[1].name,
                desc = dCom[1].desc,
                website = dCom[1].website,
                whitebook = dCom[1].whitebook,
                allreward = dCom[1].allreward
            }
            table.insert(communityCopy, itemCopy) -- 将复制后的项目添加到 communityCopy 数组中
        end
    end
    -- 需要将table转成json字符串传回
    local cJson = json.encode(communityCopy)
    Handlers.utils.reply(cJson)(msg)
end)

-- 获取个人信息
Handlers.add("getInfo", Handlers.utils.hasMatchingTag("Action", "getInfo"), function(msg)
    local tempInfo = {}

    -- 检查 usercommunity 中是否存在指定用户
    local userInfo = usercommunity[msg.Tags.userAddress]
    if userInfo then
        -- 将用户信息添加到临时表
        tempInfo.username = userInfo.username or "N/A"
        tempInfo.twitter = userInfo.twitter or "N/A"
        tempInfo.mail = userInfo.mail or "N/A"
        tempInfo.phone = userInfo.phone or "N/A"
    else
        -- 用户信息不存在时，设置默认值
        tempInfo.username = "N/A"
        tempInfo.twitter = "N/A"
        tempInfo.mail = "N/A"
        tempInfo.phone = "N/A"
    end
    -- 需要将table转成json字符串传回
    local iJson = json.encode(tempInfo)
    Handlers.utils.reply(iJson)(msg)
end)

-- 个人信息修改
Handlers.add("personalInfo", Handlers.utils.hasMatchingTag("Action", "personalInfo"), function(msg)
    print(msg.Tags.username)
    if msg.Tags.username then
        usercommunity[msg.Tags.userAddress].username = msg.Tags.username
    end

    if msg.Tags.twitter then
        usercommunity[msg.Tags.userAddress].twitter = msg.Tags.twitter
    end

    if msg.Tags.mail then
        usercommunity[msg.Tags.userAddress].mail = msg.Tags.mail
    end

    if msg.Tags.phone then
        usercommunity[msg.Tags.userAddress].phone = msg.Tags.phone
    end
end)

-- handlers方法测试功能
Handlers.add("handlersTest", Handlers.utils.hasMatchingTag("Action", "handlersTest"), function(msg)
    for _, t in ipairs(community) do
        local t1 = json.decode(t)
        print(t1)
    end
end)
