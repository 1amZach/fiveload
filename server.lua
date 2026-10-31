-- Hands the loading screen what it can't find out itself: who's online,
-- how many staff, and the latest Discord news when fivecord is running.

local function serverName()
    local name = GetConvar('sv_projectName', '')
    if name == '' then name = GetConvar('sv_hostname', '') end
    return (name:gsub('%^%d', ''))
end

local function staffOnline()
    if GetResourceState('fivecord') ~= 'started' then return nil end
    local n = 0
    for _, id in ipairs(GetPlayers()) do
        local ok, staff = pcall(function() return exports.fivecord:isStaff(id) end)
        if ok and staff then n = n + 1 end
    end
    return n
end

local function news()
    if GetResourceState('fivecord') ~= 'started' then return nil end
    local ok, n = pcall(function() return exports.fivecord:getNews() end)
    return ok and n or nil
end

AddEventHandler('playerConnecting', function(_, _, deferrals)
    deferrals.handover({
        server = {
            name = serverName(),
            players = #GetPlayers(),
            max = GetConvarInt('sv_maxclients', 48),
            staff = staffOnline(),
        },
        news = news(),
    })
end)
