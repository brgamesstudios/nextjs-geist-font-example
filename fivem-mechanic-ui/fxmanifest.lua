fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'fivem-mechanic-ui'
author 'Cursor Assistant'
version '1.0.0'
description 'Standalone mechanic NUI for FiveM'

ui_page 'html/index.html'

files {
  'html/index.html',
  'html/styles.css',
  'html/app.js'
}

shared_script 'config.lua'
client_scripts {
  'client/client.lua'
}
server_scripts {
  'server/server.lua'
}