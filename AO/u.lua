-- u is a utility library for DecentraMind
local u = { _version = "0.0.5" }

local json = require("json")

function u.tableLen(t)
  local count = 0
  for _ in pairs(t) do
    count = count + 1
  end
  return count
end

function u.deepCopy(orig)
  local orig_type = type(orig)
  local copy
  if orig_type == 'table' then
    copy = {}
    for orig_key, orig_value in next, orig, nil do
      copy[u.deepCopy(orig_key)] = u.deepCopy(orig_value)
    end
    setmetatable(copy, u.deepCopy(getmetatable(orig)))
  else   -- number, string, boolean, etc
    copy = orig
  end
  return copy
end

function u.createUuid()
  local template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
  return string.gsub(template, '[xy]', function(c)
    local v = (c == 'x') and math.random(0, 0xf) or math.random(8, 0xb)
    return string.format('%x', v)
  end)
end

function u.replyError(request, errorMsg)
  local action = (request.Tags and request.Tags.Action) or request.Action or "Unknow-Action"
  action = action .. "-Error"
  local errString = errorMsg
  if type(errorMsg) ~= "string" then
    errString = json.encode(errorMsg)
  end

  print('Reply Error: ' .. action .. ' ' .. errString)
  request.reply({ Action = action, ["Message-Id"] = request.Id, Error = errString })
end

---Reply with data
---@param data string|table
function u.replyData(request, data)
  assert(type(data) == 'table' or type(data) == 'string', 'Invalid reply data type.')
  if type(data) == 'string' then
    request.reply({ Data = data })
  else
    request.reply({ Data = json.encode(data) })
  end
end

---Find the index of the first element in the array that satisfies the predicate
---@param array table
---@param predicate function
---@return number|nil
function u.findIndex(array, predicate)
  for index, value in ipairs(array) do
    if predicate(value) then
      return index
    end
  end
  return nil -- If no element satisfies the predicate
end

---Generate a random uid using [a-zA-Z0-9]
---@return string
function u.uid(length)
  length = length or 8
  local chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  local id = ""
  for _ = 1, length do
    local index = math.random(1, #chars)
    id = id .. chars:sub(index, index)
  end
  return id
end

---@class VouchDataVouched
---@field Vouches-For string
---@field Vouchers table<string, {Identifier: string, Vouch-For: string, Value: string, Country: string, Method: string}>

---@class VouchDataNotVouched
---@field ID string
---@field Status string

function u.fetchVouchedIdentifiers(address, method, validVouchers)
  method = method or 'X'
  validVouchers = validVouchers or {}

  Send({
    Target = VouchProcessId,
    Action = 'Get-Vouches',
    ID = address
  })

  local vouchResult = Receive(function(msg)
    if (msg.From ~= VouchProcessId) then return false end
    -- print('receive from vouch process')

    if (msg.Action ~= "VouchDAO.Vouches") then return false end

    ---@type VouchDataVouched | VouchDataNotVouched
    local data = json.decode(msg.Data)
    -- print('receive vouch data of ' .. address)

    if (data["Vouches-For"] and data["Vouches-For"] == address) then
      print(address .. ' is vouched')
      return true
    end
    if (data["ID"] and data["ID"] == address) then
      print(address .. ' is not vouched')
      return true
    end

    return false
  end).Data
  print("vouchData of " .. address .. ": " .. vouchResult)

  local result = json.decode(vouchResult)
  local identifiers = {}
  if result["Vouches-For"] == address then
    if not result["Vouchers"] then
      return identifiers
    end
    for voucher, vouchData in pairs(result["Vouchers"]) do
      local isValidVoucher = u.findIndex(validVouchers, function(validVoucher)
        return validVoucher == voucher
      end)
      if isValidVoucher and vouchData['Method'] == method then
        table.insert(identifiers, vouchData['Identifier'])
      end
    end
    print('vouched identifiers: ' .. json.encode(identifiers))
    return identifiers
  end
  return identifiers
end

return u
