module.exports.info = {
  "name": "reset",
  "dm_permission": false,
  "type": 1,
  "description": "Очистити топ"
}

module.exports.run = async function(interaction) {
  const id = `${this.user.username}:${interaction.guildId}:allow:${interaction.commandName || interaction.meta[0]}`
  const allowed = await this.db.get(id) || []
  if (interaction.member.permissions.serialize().Administrator || allowed.includes(interaction.member.id)) {
    await this.db.clear(`${this.user.username}:${interaction.guildId}:stats`)
  
    interaction.reply({
      content: `Топ 10 сервера ${interaction.guild.name} очищенно`,
      ephemeral: true 
    })
  } else interaction.reply({ content: '❌ У вас недостатньо прав для виконання команди', ephemeral: true }).catch(e => this.error(e));
}