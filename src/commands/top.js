module.exports.info = {
  "name": "top",
  "dm_permission": false,
  "type": 1,
  "description": "Відобразити топ 10"
}

module.exports.run = async function(interaction) {
  const users = await this.db.get(`${this.user.username}:${interaction.guildId}:stats`) || []

  if (users?.length <= 0) {
    interaction.reply({
      embeds:[
        {
          "type": "rich",
          "color": interaction.user.id == process.env.AUTHOR_ID ? 0x5a3cbb : 0x313e3e,
          "description": "Немає користувачів для відображення"
        }
      ],
      ephemeral: true 
    })
    return
  }

  let sortable = [];
  let description = "";

  for (var user in users) {
    sortable.push([user, users[user]]);
  }

  sortable.sort((a, b) => a[1] - b[1]);
  sortable = sortable.reverse()

  sortable.slice(0,10).forEach((u, i) => {
    const emoji = [`:first_place:`,`:second_place:`,`:third_place:`]
    description += `${emoji[i] ? `${emoji[i]} ` : ':star:'}<@${u[0]}> - ${u[1].declension({one: 'бал', few: 'бала', many: 'балів'})}\n`
  });

  interaction.reply({
    embeds:[
      {
        "type": "rich",
        "title": `:trophy: Топ 10 сервера ${interaction.guild.name}`,
        "color": user.id == process.env.AUTHOR_ID ? 0x5a3cbb : 0x313e3e,
        description,
        "footer": {
          "text": `*${sortable.length.declension()} відповідали правильно`,
          "iconURL": `${interaction.guild.iconURL() || "https://cdn.discordapp.com/attachments/539138991031844864/986493279833055262/planning1.png"}`
        }
      }
    ]
  })
}