fx_version 'cerulean'
game 'gta5'

name 'advanced_mechanic'
author 'YourName'
description 'Advanced Mechanic Script for FiveM'
version '1.0.0'

lua54 'yes'

ui_page 'html/index.html'

files {
  'html/index.html',
  'html/style.css',
  'html/script.js',
  'html/assets/*.png',
  'html/assets/*.jpg'
}

shared_scripts {
  'config.lua',
  'shared/utils.lua'
}

client_scripts {
  'client/main.lua'
}

server_scripts {
  'server/main.lua'
}

dependencies {
  'es_extended'
}