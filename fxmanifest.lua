fx_version 'cerulean'
game 'gta5'

author 'YourName'
description 'Advanced Mechanic Script for FiveM'
version '1.0.0'

shared_scripts {
    'config.lua',
    'shared/*.lua'
}

client_scripts {
    'client/*.lua'
}

server_scripts {
    'server/*.lua'
}

ui_page 'html/index.html'

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