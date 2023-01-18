module.exports.info = {
  "name": "access",
  "dm_permission": false,
  "type": 1,
  "description": "Список дозволів для виконання команди",
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
  }]
}

module.exports.run = async function(interaction) {
  const id = `${this.user.username}:${interaction.guildId}:allow:${interaction.commandName || interaction.meta[0]}`
  const allowed = await this.db.get(id) || []
  const command = interaction.options.get("command").value
  const id2 = `${this.user.username}:${interaction.guildId}:allow:${command}`

  if (interaction.member.permissions.serialize().Administrator || allowed.includes(interaction.member.id)) {
    const users = await this.db.get(id2) || []
    let content = `Користувачі які мають дозвіл до команди ${command}\n`
    if (users.length > 0) {
      users.forEach(u => {
        content += `<@${u}> `
      });
    } else {
      content += ' - Немає користувачів'
    }
    interaction.reply({ content, ephemeral: true }).catch(e => console.error(e));
  } else interaction.reply({ content: '❌ У вас недостатньо прав для виконання команди', ephemeral: true }).catch(e => console.error(e));
}