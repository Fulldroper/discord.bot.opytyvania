module.exports.info = {
  "name": "channel",
  "dm_permission": false,
  "type": 1,
  "description": "Вибрати канал для публікації",
  "options": [{
    "name": "channel",
    "description": "Текстовий канал",
    "type": 7,
    "required": true
  }]
}

module.exports.run = async function(interaction) {
  const id = `${this.user.username}:${interaction.guildId}:allow:${interaction.commandName || interaction.meta[0]}`
  const allowed = await this.db.get(id) || []
  if (interaction.member.permissions.serialize().Administrator || allowed.includes(interaction.member.id)) {
    const ref = interaction.options.get("channel")
      this.db.set(`${this.user.username}:${interaction.guildId}:settings`, {channel: ref.value})
      interaction.reply({ content: `✅ <#${ref.value}>, встановлено як канал для публікацій.`, ephemeral: true }).catch(e => this.error(e));
  } else interaction.reply({ content: '❌ У вас недостатньо прав для виконання команди', ephemeral: true }).catch(e => this.error(e));
}