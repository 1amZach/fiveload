fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'fiveload'
description 'Loading screen with real progress, tips, music, server info and Discord news'
version '1.0.0'
author 'IamZach'
discord 'https://discord.gg/agn'
repository 'https://github.com/1amZach/fiveload'

loadscreen 'html/index.html'
loadscreen_cursor 'yes'
loadscreen_manual_shutdown 'yes'

files {
    'html/index.html',
    'html/style.css',
    'html/app.js',
    'html/config.js',
    'html/logo.svg',
    'html/media/*',
}

server_script 'server.lua'
client_script 'client.lua'
