import Build from './lib/build'
import pkg from '../package.json'

const COMMAND_NAME = 'wdio'
const COMMAND_ALIAS = 'b'
const COMMAND_USAGE = '<argument> [option]'

hexo.extend.console.register(COMMAND_NAME, pkg.description, {
    alias: COMMAND_ALIAS,
    usage: COMMAND_USAGE,
    arguments: [
        { name: 'build', desc: 'npm run clean && npm install && npm run copy-docs && npm run generate-markdown && npm run generate && npm run compass && npm run compress-css && npm run compress-js && npm run remove-obsoletes && npm run webmastertools' },
        { name: 'webmastertools', desc: ' echo \"google-site-verification: googleb498eedc81b2abab.html\" > ./public/googleb498eedc81b2abab.html' },
        { name: 'clean', desc: 'rm -fr ./public ./source/api ./node_modules' },
        { name: 'generate', desc: 'hexo generate' },
        { name: 'remove-obsoletes', desc: 'rm -fr ./public/css/config.rb ./public/css/screen.scss' },
        { name: 'compress-css', desc: 'yuicompressor ./public/css/screen.css > ./public/css/tmp.css && mv ./public/css/tmp.css ./public/css/screen.css' },
        { name: 'compress-js', desc: 'yuicompressor ./public/js/app.js -o ./public/js/tmp.js && mv ./public/js/tmp.js ./public/js/app.js' },
        { name: 'compass', desc: 'rm -f themes/webdriver.io/source/css/screen.css && cd themes/webdriver.io/source/css && compass compile && cd ../../../../' },
        { name: 'copy-docs', desc: 'cp -r node_modules/webdriverio/docs/** source/' },
        { name: 'generate-markdown', desc: 'mkdir ./source/api && npm run generate-protocol-commands && npm run generate-action-commands' },
        { name: 'generate-protocol-commands', desc: './node_modules/.bin/wddoc -i ./node_modules/webdriverio/lib/protocol/**/*.js -o ./source/api -t ./node_modules/wddoc/templates/template.md.ejs' },
        { name: 'generate-action-commands', desc: './node_modules/.bin/wddoc -i ./node_modules/webdriverio/lib/commands/**/*.js -o ./source/api -t ./node_modules/wddoc/templates/template.md.ejs' }
    ]
}, async (command) => {
    let build = new Build(command, hexo)
    await build.run()
})
