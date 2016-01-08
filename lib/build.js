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
}

export default Build
