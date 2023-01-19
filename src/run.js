// aplication runner
(async () => {
  // env configuration
  process.env.NODE_ENV || await require('dotenv').config({ debug: false })
  // req discord framework
  const { Client, GatewayIntentBits } = await require('discord.js');  
  // mout moded prorotypes
  (require("./moded_prototypes"))()
  // init discord bot && rest obj
  const bot = new Client({ intents: [
    GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildIntegrations
  ] });
  // catch errors
  const axios = await require("axios").default
  // log function
  bot.log = (...x) => {
    console.log(...x)
    axios({
      method: 'post',
      url: process.env.ERROR_WEBHOOK_URL,
      headers:{
        "Content-Type": "multipart/form-data"
      },
      data: { 
        content:`\`\`\`js\n${x?.stack || x.join("")}\`\`\``,
        username: this?.user?.username || process.env.npm_package_name,
        avatar_url: this?.user?.avatarURL() || ''
      }
    })
  }
  // error handle hook
  bot.error = (x) => {
    console.log(x)
    axios({
      method: 'post',
      url: process.env.ERROR_WEBHOOK_URL,
      headers:{
        "Content-Type": "multipart/form-data"
      },
      data: { 
        content:`\`\`\`js\n${x?.stack || x}\`\`\``,
        username: this?.user?.username || process.env.npm_package_name,
        avatar_url: this?.user?.avatarURL() || ''
      }
    })
  }
  // error handle
  bot.on("error", bot.error)
  // wait timer
  const sleep = time => new Promise(r => setTimeout(() => r, time))
  // run bot
  bot.login(process.env.TOKEN)
  bot.on("ready", async function () {
    Number.prototype.msToDate = function (x) {
      if (!x) x = this;
      x = Number.parseInt(x, 10)
      const 
        toSec = 1000,
        toMin = toSec * 60,
        toHour = toMin * 60,
        toDay = toHour * 24,
        toYears = toDay * 365.25,
        f = b => {
            const n = Math.trunc(x / b);
            return (n > 0 ? (x = x - (n * b), n) : undefined);
        }
      return {
        y : f(toYears),
        d : f(toDay),
        h : f(toHour),
        m : f(toMin),
        s : f(toSec)
      }; 
  }
  /**
   * Merges given count and on of declensions: one, few or many into a string
   * @param {Object} config - required configuration from number, and declensions for quantities one, few and many
   * @param {number} config.count - quantity of something
   * @param {string} config.one - word describing one
   * @param {string} config.few - a word that describes several
   * @param {string} config.many - a word that describes a lot
   * @example
   * declension({ count: 5, one: 'користувач', few: 'користувача', many: 'користувачів' });
   * // 5 користувачів
   * @return {string} a string from a number and the desired declension
   */
   Number.prototype.declension = function(options = {}) {
    const {
      one = 'користувач',
      few = 'користувача',
      many = 'користувачів',
      count = this
    } = options
    if (Number.isNaN(count)) return false;
    // reserve declaration
    const declensionNumbers = {
      '1': one,
      '2': few,
      '3': few,
      '4': few,
      '5': many,
      '6': many,
      '7': many,
      '8': many,
      '9': many,
      '0': many
    }
    // check declension and return
    return `${count} ${declensionNumbers[String(count).slice(-1)]}`    
  }
    // add command builder
    await require("fd-dcc").call(this)
    // create site
    require("fd-dsite").call(this)
    // add desctiption manager
    await require("fd-desc-changer").call(this)
    // change bot description
    this.description = process.env.npm_package_config_description
    // add and connect to db
    this.db = new (require("fd-redis-api"))(process.env.REDIS_URL)
    this.db.onError(this.error)
    await this.db.connect()
    // calc count of users
    this.users_counter = this.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)
    // get env description
    let description_moded = process.env.npm_package_config_description
    // fetch cmds
    const moded_cmds = description_moded.matchAll(/\$[a-z]{1,32}/gm)
    // fetsh envs
    const moded_var = description_moded.matchAll(/\@[a-z]{1,32}/gm)
    // replace command
    for (const t of moded_cmds) {
      const c = t[0].slice(1)
      if (this.commands[c]) {
        description_moded = description_moded.replaceAll(t[0],`</${c}:${this.commands[c].id}>`)
      }
    }
    // replace command
    for (const t of moded_var) {
      const c = t[0].slice(1)
      if (process.env[`npm_package_config_${c}`]) {
        description_moded = description_moded.replaceAll(t[0], process.env[`npm_package_config_${c}`])
      }
    }
    // change bot description
    this.description = description_moded.slice(0,400 - 3) + "..."
    // log statistic
    this.log(
      `🚀 Start as ${this.user.tag} at `, new Date,
      `\n📊 Servers:`,this.guilds.cache.size,` Users:`, this.users_counter || 0,` Commands:`, Object.keys(this.commands).length,
      `\n📜 Description: \n\t+ ${description_moded} \n\t- ${await this.description}`,
      `\n🗃️  Commands:`, Object.keys(this.commands),
      `\n started with interval ${process.env.npm_package_config_interval}ms`
    )
    // starting loop
    const { close } = this.commands["create"]
    setInterval((async function() {
      const loop = await this.db.get(`${this.user.username}:loop`)
      console.log("loop", loop);
      if (!loop || loop.length <= 0) return
      for (const o of loop) {
        if (new Date().getTime() - o.startOn >= o.time) {
          console.log("close", o)
          close.call(this, o)
        }
      }
    }).bind(this), process.env.npm_package_config_interval);
  //   while (true) {
  //     (async function() {
  //       const loop = await this.db.get(`${this.user.username}:loop`)
  //       if (!loop || loop.length <= 0) return
  //       for (const o of loop) {
  //         if (new Date().getTime() - o.startOn >= o.time) {
  //           console.log("close", o)
  //           close.call(this, o)
  //         }
  //       }
  //     }).call(this)
  //     // wait ms
  //     await sleep(process.env.npm_package_config_interval)
  //   }
  })
})()