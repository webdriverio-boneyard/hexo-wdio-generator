import shelljs from 'shelljs'

const NPM_DEPS = [
    'hexo-deployer-s3@^0.1.0',
    'hexo-generator-alias@^0.1.0',
    'hexo-generator-sitemap@^1.0.1',
    'hexo-renderer-ejs@^0.1.0',
    'hexo-renderer-marked@^0.2.6',
    'hexo-renderer-stylus@^0.3.0',
    'hexo-server@^0.1.2',
    'webdriverio/wddoc',
    'webdriverio/webdriverio'
]

class Build {
    constructor (args, hexo) {
        this.hexo = hexo
        this.args = args
        this.command = this[args._[0]]
    }

    async run () {
        /**
         * show command description if command doesn't exist
         */
        if (!this.command) {
            return this.hexo.call('help', {_: ['wdio']})
        }

        await this.command()
    }

    /**
     * helper method to use exec with callbacks for better performance
     */
    async execute (command, silent = false) {
        console.log(`> ${command}`)
        await new Promise((resolve, reject) => {
            shelljs.exec(command, { silent: silent }, (code, output) => {
                if (code !== 0) {
                    return reject(new Error(`command '${command}' failed with exit code ${code}`))
                }

                return resolve(output)
            })
        })
    }

    /**
     * clean public folder, markdown files and node_modules directory
     */
    async clean () {
        await this.execute('rm -fr ./public ./source/**/*.md')
    }

    /**
     * installs page dependencies
     */
    async install () {
        await Promise.all(NPM_DEPS.map((pkg) => {
            return this.execute(`npm i ${pkg}`)
        }))
    }

    /**
     * copies over markdown files from webdriverio package
     */
    async getDocs () {
        await this.execute('cp -r node_modules/webdriverio/docs/** source/')
    }

    /**
     * generate action commands with wddoc
     */
    async generateActionCommands () {
        await this.execute('./node_modules/.bin/wddoc -i ./node_modules/webdriverio/lib/commands/**/*.js -o ./source/api -t ./node_modules/wddoc/templates/template.md.ejs')
    }

    /**
     * generate protocol commands with wddoc
     */
    async generateProtocolCommands () {
        await this.execute('./node_modules/.bin/wddoc -i ./node_modules/webdriverio/lib/protocol/**/*.js -o ./source/api -t ./node_modules/wddoc/templates/template.md.ejs')
    }

    /**
     * generates markdown files from webdriverio package
     */
    async generateMarkdown () {
        await this.getDocs()
        await this.execute('mkdir ./source/api')
        await this.generateProtocolCommands()
        await this.generateActionCommands()
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
    async build () {
        await this.clean()
        await this.generateMarkdown()
        await this.generate()
        await this.compass()
        await this.compressCSS()
        await this.compressJS()
        await this.webmastertools()
    }
}

export default Build
