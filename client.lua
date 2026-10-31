-- Fade the loading screen out once the game is ready. A multicharacter or
-- spawn selector shows up right after.

CreateThread(function()
    while not NetworkIsSessionStarted() do Wait(250) end
    SendLoadingScreenMessage(json.encode({ fiveload = 'done' }))
    Wait(900)
    ShutdownLoadingScreenNui()
    ShutdownLoadingScreen()
end)
