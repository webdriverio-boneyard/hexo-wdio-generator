import shelljs from 'shelljs'

const ROOT_FOLDER = './source'
const API_FOLDER = '/api'

const WDDOC_TEMPLATE = './node_modules/wddoc/templates/template.md.ejs'

class Build {
    constructor (args, opts, hexo) {
        this.args = args
        this.hexo = hexo
        this.command = this[args._[0]]

        this.opts = Object.assign({
            clean: true
        }, opts)
    }

    async run (params) {
        /**
         * show command description if command doesn't exist
         */
        if (!this.command) {
            return this.hexo.call('help', {_: ['wdio']})
        }

        await this.command.apply(this, params)
    }

    /**
     * helper method to use exec with callbacks for better performance
     */
    async execute (command, silent = false) {
        console.log(`> ${command}`)
        return await new Promise((resolve, reject) => {
            let output = ''
            let child = shelljs.exec(command, { silent: silent }, (code) => {
                if (code !== 0) {
                    return reject(new Error(`command '${command}' failed with exit code ${code}`))
                }

                return resolve(output)
            })

            child.stdout.on('data', (data) => {
                output += data
            })
        })
    }

    /**
     * clean public folder, markdown files and node_modules directory
     */
    async clean () {
        await this.execute('rm -fr ./public*')
        await this.execute('find ./source -name "*.md" -exec rm -rf {} +')
        await this.execute('find source -empty -type d -delete')
    }

    /**
     * copies over markdown files from webdriverio package
     */
    async getDocs (targetDir) {
        await this.execute(`mkdir -p ${targetDir}`)
        await this.execute(`cp -r node_modules/webdriverio/docs/** ${targetDir}`)
        await this.execute(`cp node_modules/webdriverio/CONTRIBUTING.md ${targetDir}/contribute.md`)
    }

    /**
     * generate action commands with wddoc
     */
    async generateActionCommands (targetDir = ROOT_FOLDER + API_FOLDER) {
        await this.execute(`./node_modules/.bin/wddoc -i ./node_modules/webdriverio/lib/commands/**/*.js -o ${targetDir} -t ${WDDOC_TEMPLATE}`)
    }

    /**
     * generate protocol commands with wddoc
     */
    async generateProtocolCommands (targetDir = ROOT_FOLDER + API_FOLDER) {
        await this.execute(`./node_modules/.bin/wddoc -i ./node_modules/webdriverio/lib/protocol/**/*.js -o ${targetDir} -t ${WDDOC_TEMPLATE}`)
    }

    /**
     * generates markdown files from webdriverio package
     */
    async generateMarkdown (version = '') {
        if (version) {
            version = `/${version}`
        }

        let rootFolder = ROOT_FOLDER + version
        let apiFolder = rootFolder + API_FOLDER

        await this.getDocs(rootFolder)
        await this.execute(`mkdir -p ${apiFolder}`)
        await this.generateProtocolCommands(apiFolder)
        await this.generateActionCommands(apiFolder)
    }

    /**
     * compiles sass files
     */
    async compass () {
        await this.execute('rm -f themes/webdriver.io/source/css/screen.css && cd themes/webdriver.io/source/css && compass compile && cd ../../../../')
    }

    /**
     * generate page with hexo
     */
    async generate () {
        await this.execute('hexo generate')
    }

    /**
     * minifies css
     */
    async compressCSS () {
        await this.execute('yuicompressor ./public/css/screen.css > ./public/css/tmp.css && mv ./public/css/tmp.css ./public/css/screen.css')
    }

    /**
     * minifies js
     */
    async compressJS () {
        await this.execute('yuicompressor ./public/js/app.js -o ./public/js/tmp.js && mv ./public/js/tmp.js ./public/js/app.js')
    }

    /**
     * generates webmastertools verification
     */
    async webmastertools () {
        await this.execute('echo "google-site-verification: googleb498eedc81b2abab.html" > ./public/googleb498eedc81b2abab.html')
    }

    /**
     * kicks of complete build process
     */
    async build (v, clean) {
        let versionsToGenerate = []
        if (v === 'all') {
            versionsToGenerate = this.opts.builds
        } else {
            versionsToGenerate = this.opts.builds.filter((build) => build.apiVersion === v)
        }

        if (versionsToGenerate.length === 0 || v === 'all') {
            versionsToGenerate.push({
                apiVersion: 'latest',
                webdriverio: 'latest',
                wddoc: 'latest'
            })
        }

        if (this.opts.clean) {
            await this.clean()
        }

        for (let build of versionsToGenerate) {
            /**
             * install required dependencies for build
             */
            await this.execute('npm i webdriverio@' + build.webdriverio)
            await this.execute('npm i wddoc@' + build.wddoc)

            /**
             * generate markdown for api version
             */
            if (build.apiVersion === 'latest') {
                await this.generateMarkdown()
            } else {
                await this.generateMarkdown(build.apiVersion)
            }
        }

        /**
         * build website
         */
        await this.generate()
        await this.compass()
        await this.compressCSS()
        await this.compressJS()
        await this.webmastertools()
    }
}

export default Build
