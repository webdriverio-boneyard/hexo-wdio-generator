import Build from './lib/build'
import pkg from '../package.json'

const COMMAND_NAME = 'wdio'
const COMMAND_ALIAS = 'b'
const COMMAND_USAGE = '<argument> [option]'

hexo.extend.console.register(COMMAND_NAME, pkg.description, {
    alias: COMMAND_ALIAS,
    usage: COMMAND_USAGE,
    arguments: [
        { name: 'build', desc: 'kicks of complete build process' },
        { name: 'clean', desc: 'clean public folder, markdown files and node_modules directory' },
        { name: 'install', desc: 'installs page dependencies' },
        { name: 'getDocs', desc: 'copies over markdown files from webdriverio package' },
        { name: 'generateActionCommands', desc: 'generate action commands with wddoc' },
        { name: 'generateProtocolCommands', desc: 'generate protocol commands with wddoc' },
        { name: 'generateMarkdown', desc: 'generates markdown files from webdriverio package' },
        { name: 'compass', desc: 'compiles sass files' },
        { name: 'generate', desc: 'generate page with hexo' },
        { name: 'compressCSS', desc: 'minifies CSS' },
        { name: 'compressJS', desc: 'minifies JS' },
        { name: 'webmastertools', desc: 'generates webmastertools verification' }
    ]
}, async (command) => {
    let build = new Build(command, hexo)
    await build.run()
})
