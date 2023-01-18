// aplication runner
(async () => {
  // env configuration
  process.env.NODE_ENV || await require('dotenv').config({ debug: false })
  // req discord framework
  const { Client, GatewayIntentBits } = await require('discord.js');  
  // mout moded prorotypes
  require("moded_prototypes")()
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
      `\n🗃️  Commands:`, Object.keys(this.commands)
    )
    // starting loop
    const { close } = this.commands["create"]
    this.log(`[readyLoop] started with interval ${process.env.npm_package_config_interval}ms`);
    while (true) {
      (async function() {
        const loop = await this.db.get(`${this.user.username}:loop`)
        if (!loop || loop.length <= 0) return
        for (const o of loop) {
          if (new Date().getTime() - o.startOn >= o.time) {
            close.call(this, o)
          }
        }
      }).call(this)
      // wait ms
      await sleep(process.env.npm_package_config_interval)
    }
  })
})()