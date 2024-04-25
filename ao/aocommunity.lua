community = community or {}

local json = require("json")

Handlers.add("add", Handlers.utils.hasMatchingTag("Action", "add"), function(msg)
    local encodedData = json.encode({
        id = msg.From,
        communityName = "xDAO",
        decs = "This is nice"
    })
    table.insert(community, encodedData)
    Handlers.utils.reply("add")(msg)
end)

Handlers.add("communitylist", Handlers.utils.hasMatchingTag("Action", "communitylist"), function(msg)
    Handlers.utils.reply(table.concat(community))(msg)
end)
