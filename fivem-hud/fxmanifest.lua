fx_version 'cerulean'
game 'gta5'

lua54 'yes'

name 'fivem-hud'
author 'Cursor AI'
description 'Lightweight standalone HUD with speedometer, health/armor, street/zone, compass, and voice indicators.'
version '1.0.0'

ui_page 'html/index.html'

files {
  'html/index.html',
  'html/styles.css',
  'html/app.js'
}

shared_scripts {
  'config.lua'
}

client_scripts {
  'client/*.lua'
}

server_scripts {
  'server/*.lua'
}