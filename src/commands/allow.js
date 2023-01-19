module.exports.info = {
  "name": "allow",
  "dm_permission": false,
  "type": 1,
  "description": "Видати дозвіл виконання команди",
  "options": [{
    "name": "command",
    "description": "назва команди",
    "type": 3,
    "choices": [
      {"name": "create", "value": "create"},
      {"name": "reset", "value": "reset"},
      {"name": "access", "value": "access"},
      {"name": "channel", "value": "channel"},
      {"name": "allow", "value": "allow"}
    ],
    "channel_types": 0,
    "required": true
  },{
    "name": "user",
    "description": "користувач",
    "type": 6,
    "channel_types": 0,
    "required": true
  }]
}

module.exports.run = async function(interaction) {
  const id = `${this.user.username}:${interaction.guildId}:allow:${interaction.commandName || interaction.meta[0]}`
  const allowed = await this.db.get(id) || []
  const command = interaction.options.get("command").value
  const user = interaction.options.get("user").value
  const id2 = `${this.user.username}:${interaction.guildId}:allow:${command}`

  if (interaction.member.permissions.serialize().Administrator || allowed.includes(interaction.member.id)) {
    const users = await this.db.get(id2) || []
    if (users.includes(user)) {
      interaction.reply({ content: `Користувачу <@${user}> вже дозволено виконувати команду \`${command}\``, ephemeral: true }).catch(e => this.error(e));
    } else {
      await this.db.push(id2, user)
      interaction.reply({ content: `Користувачу <@${user}> дозволено виконувати команду \`${command}\``, ephemeral: true }).catch(e => this.error(e));
    }
  } else interaction.reply({ content: '❌ У вас недостатньо прав для виконання команди', ephemeral: true }).catch(e => this.error(e));
}