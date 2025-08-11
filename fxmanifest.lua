fx_version 'cerulean'
game 'gta5'

lua54 'yes'

author 'YourName'
description 'Advanced Mechanic Script for FiveM'
version '1.0.0'

ui_page 'html/index.html'

shared_scripts {
    'config.lua',
    'shared/*.lua'
}

client_scripts {
    'client/*.lua'
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/*.lua'
}

files {
    'html/index.html',
    'html/style.css',
    'html/script.js',
    'html/assets/*.png',
    'html/assets/*.jpg'
}

dependencies {
    'es_extended'
}