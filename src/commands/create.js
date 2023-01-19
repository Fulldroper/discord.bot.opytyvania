const EX = 3600000;
const MAX_TIME = 604800000 

async function close({ guildId, voteId, channelId, messageId }) {
  try {
    // const msg = await this.guilds.cache.get(guildId).channels.cache.get(channelId).messages.fetch(messageId)
    const ch = await this.channels.fetch(channelId);
    // const m_ = await ch.messages.fetch({
    //   limit: 1, // Amount of messages to be fetched in the channel
    //   before: messageId,
    //   after: messageId,
    // })
    // this.log(m_);
    // const msg = m_.entries().next().value[1]
    let msg = await ch.messages.fetch(messageId);
    // list variants
    const variants = await this.db.get(
      `${this.user.username}:${guildId}:vote:${voteId}:variants`
    );
    // list of votes
    const users = await this.db.get(
      `${this.user.username}:${guildId}:vote:${voteId}:votes`
    );
    // get right if exist
    const right = await this.db.get(
      `${this.user.username}:${guildId}:vote:${voteId}:right`
    );
    // embed
    const embed = await this.db.get(
      `${this.user.username}:${guildId}:vote:${voteId}:embed`
    );
    // loops
    let loop = (await this.db.get(`${this.user.username}:loop`)) || [];
    loop = loop.filter((o) => o.messageId !== messageId);
    if (loop.length <= 0) {
      await this.db.clear(`${this.user.username}:loop`);
    } else {
      await this.db.set(`${this.user.username}:loop`, loop);
    }
    // reform obj
    const result = { users };
    if (!variants) return;
    result.params = variants.map((value) => {
      let r = { value };
      if (right) r.isCorrect = r.value === right[0];
      return r;
    });
    // if test
    if (right) {
      const rightId = result.params.findIndex((v) => v.isCorrect);
      const rlen = users ? users[rightId].length : 0;
      const stats =
        (await this.db.get(`${this.user.username}:${guildId}:stats`)) || {};
      for (let i = 0; i < rlen; i++) {
        stats[users[rightId][i]] = stats[users[rightId][i]]
          ? ++stats[users[rightId][i]]
          : 1;
      }
      await this.db.get(`${this.user.username}:${guildId}:stats`, stats);
    }
    // clear in db vote
    await this.db.clear(
      `${this.user.username}:${guildId}:vote:${voteId}:variants`
    );
    await this.db.clear(
      `${this.user.username}:${guildId}:vote:${voteId}:votes`
    );
    await this.db.clear(
      `${this.user.username}:${guildId}:vote:${voteId}:right`
    );
    await this.db.clear(
      `${this.user.username}:${guildId}:vote:${voteId}:embed`
    );
    await this.db.clear(
      `${this.user.username}:${guildId}:vote:${voteId}:userLimit`
    );
    // render res
    const canvas = await (require("./../render"))(result);
    // edit msg
    const bodyFormData = new (require("form-data"))();
    bodyFormData.append("key", process.env.IMG_TOKEN);
    bodyFormData.append("media", await canvas.toBuffer("image/png"), "res.png");
    const res = await require("axios")({
      method: "post",
      url: "https://thumbsnap.com/api/upload",
      data: bodyFormData,
      headers: { "Content-Type": "multipart/form-data" },
    });
    let usrs = 0;
    if (users) {
      users.forEach((e) => (usrs += e.length));
    }
    embed[0].footer.text = `*${usrs.declension({
      one: "учасник",
      few: "учасника",
      many: "учасників",
    })}`;

    await msg.edit({
      embeds: [embed[0]],
      components: [],
    }).catch(() => {
      msg = await ch.send({
        embeds: [embed[0]],
        components: [],
      }
    })


    await msg.reply({
      embeds: [
        {
          type: "rich",
          description: `📄 **Результат опитування**`,
          color: 0x313e3e,
          image: {
            url: `https://thumbsnap.com/i/${res.data.data.id}.png?1203`,
          },
        },
      ],
    });
    
  } catch (error) {
    this.error(error);
  }
}

module.exports.info = {
  name: "create",
  type: 1,
  dm_permission: false,
  description: "Створити опитування",
  options: [
    {
      name: "text",
      description: "Текст опитування",
      type: 3,
      max_length: 4000,
      required: true,
    },
    {
      name: "image",
      description: "Додадкове зображення до опитування",
      type: 11,
      channel_types: 0,
      required: false,
    },
  ],
};

module.exports.run = async function (interaction) {
  const id = `${this.user.username}:${interaction.guildId}:allow:${
    interaction.commandName || interaction.meta[0]
  }`;
  const allowed = (await this.db.get(id)) || [];
  if (
    interaction.member.permissions.serialize().Administrator ||
    allowed.includes(interaction.member.id)
  ) {
    const ref = await this.db.get(
      `${this.user.username}:${interaction.guildId}:settings`
    );
    if (ref?.channel) {
      if (interaction.channelId === ref.channel) {
        const user = interaction.member.user;
        let { value } = interaction.options.get("text");
        const img = interaction.options.get("image");
        const embeds = [
          {
            type: "rich",
            // "title": `Опитування від ${user.username}#${user.discriminator}`,
            color: user.id == process.env.AUTHOR_ID ? 0x5a3cbb : 0x313e3e,
            description: `${value}`,
            // "thumbnail": {
            //   "url": `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
            //   "height": 0,
            //   "width": 0
            // },
            footer: {
              text: `*вірна відповідь не обов'язкова`,
              iconURL: `${
                interaction.guild.iconURL() ||
                "https://cdn.discordapp.com/attachments/539138991031844864/986493279833055262/planning1.png"
              }`,
            },
          },
        ];

        if (img?.attachment?.url) embeds[0].image = { url: img.attachment.url };

        await interaction
          .reply({
            embeds,
            components: [
              {
                type: 1,
                components: [
                  {
                    type: 2,
                    label: "Опублікувати",
                    emoji: "✅",
                    style: 3,
                    custom_id: `${interaction.commandName}:accept`,
                  },
                ],
              },
              {
                type: 1,
                components: [
                  {
                    type: 2,
                    label: "Додати варіант відповіді",
                    emoji: "📝",
                    style: 1,
                    custom_id: `${interaction.commandName}:add`,
                  },
                ],
              },
              {
                type: 1,
                components: [
                  {
                    type: 2,
                    label: "Вибрати вірний варіант",
                    emoji: "🏷️",
                    style: 1,
                    custom_id: `${interaction.commandName}:list:right`,
                  },
                ],
              },
              {
                type: 1,
                components: [
                  {
                    type: 2,
                    label: "Видалити варіант",
                    emoji: "✂️",
                    style: 4,
                    custom_id: `${interaction.commandName}:list:remove`,
                  },
                ],
              },
            ],
            ephemeral: true,
          })
          .catch(() => 0);
        const message = await interaction.fetchReply();
        this.db.set(
          `${this.user.username}:${interaction.guildId}:vote:${message.id}:embed`,
          embeds
        );
      } else
        interaction
          .reply({
            content: `❌ Цей канал не є каналом для публікацій, спробуйте в каналі <#${ref.channel}>.`,
            ephemeral: true,
          })
          .catch((e) => this.error(e));
    } else
      interaction
        .reply({
          content: `❌ Канал для публікацій за замовчуванням не встановлено. Введіть команду </${"channel"}:${
            this.commands["channel"].id
          }> для цього`,
          ephemeral: true,
        })
        .catch((e) => this.error(e));
  } else
    interaction
      .reply({
        content: `❌ У вас недостатньо прав для виконання команди`,
        ephemeral: true,
      })
      .catch((e) => this.error(e));
};

module.exports.component = async function (interaction) {
  switch (interaction.meta[1]) {
    case "accept":
      const variants__ = await this.db.get(
        `${this.user.username}:${interaction.guildId}:vote:${interaction.message.id}:variants`
      );
      const right_ = await this.db.get(
        `${this.user.username}:${interaction.guildId}:vote:${interaction.message.id}:right`
      );
      if (variants__ === null || variants__.length <= 0) {
        interaction.reply({
          content: "Не вказані варіантів відповіді",
          ephemeral: true,
        });
        return;
      }

      if (right_) {
        await interaction.showModal({
          title: "Введіть налаштування",
          custom_id: `${interaction.meta[0]}:publish:${interaction.message.id}`,
          components: [
            {
              type: 1,
              components: [
                {
                  type: 4,
                  custom_id: "time",
                  label: "Секунд на відповідь (Не обов'язково)",
                  style: 1,
                  min_length: 1,
                  max_length: 10,
                  placeholder: `${EX / 1000}`,
                  required: false,
                },
              ],
            },
            {
              type: 1,
              components: [
                {
                  type: 4,
                  custom_id: "users",
                  label: "Ліміт на людей (Не обов'язково)",
                  style: 1,
                  min_length: 1,
                  max_length: 10,
                  required: false,
                },
              ],
            },
          ],
        });
      } else {
        interaction.reply({
          content: "Ви не вказади вірний варіантів відповіді. Пробовжити?",
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  label: "Опублікувати",
                  emoji: "✅",
                  style: 3,
                  custom_id: `${interaction.meta[0]}:accept_2:${interaction.message.id}`,
                },
                {
                  type: 2,
                  label: "Вибрати вірний варіант",
                  emoji: "🏷️",
                  style: 1,
                  custom_id: `${interaction.meta[0]}:list:right:${interaction.message.id}`,
                },
              ],
            },
          ],
          ephemeral: true,
        });
      }

      try {
        await interaction.reply({
          content: "Введіть варіант відповіді",
          ephemeral: true,
        });
      } catch (error) {}
      break;
    case "accept_2":
      await interaction.showModal({
        title: "Введіть налаштування",
        custom_id: `${interaction.meta[0]}:publish:${interaction.meta[2]}`,
        components: [
          {
            type: 1,
            components: [
              {
                type: 4,
                custom_id: "time",
                label: "Секунд на відповідь (Не обов'язково)",
                style: 1,
                min_length: 1,
                max_length: 9,
                placeholder: `Макс. ${MAX_TIME / 1000}`,
                required: false,
              },
            ],
          },
          {
            type: 1,
            components: [
              {
                type: 4,
                custom_id: "users",
                label: "Ліміт на людей (Не обов'язково)",
                style: 1,
                min_length: 1,
                max_length: 10,
                required: false,
              },
            ],
          },
        ],
      });
      break;
    case "list":
      const mid = interaction.meta[3] || interaction.message.id;
      const variants = await this.db.get(
        `${this.user.username}:${interaction.guildId}:vote:${mid}:variants`
      );
      if (variants === null || variants.length <= 0) {
        interaction.reply({
          content: "Немає варіантів відповіді",
          ephemeral: true,
        });
        return;
      }

      const options = [];

      variants.forEach((v) => {
        options.push({
          label: v,
          value: v,
          emoji: {
            name: "📄",
          },
        });
      });

      await interaction
        .reply({
          components: [
            {
              type: 1,
              components: [
                {
                  type: 3,
                  custom_id: `${interaction.meta[0]}:${interaction.meta[2]}:${mid}`,
                  options,
                  placeholder: "Виберіть варіант відповіді",
                  min_values: 1,
                  max_values: 1,
                },
              ],
            },
          ],
          ephemeral: true,
        })
        .catch((e) => this.log(e));
      break;
    case "right":
      this.db.set(
        `${this.user.username}:${interaction.guildId}:vote:${interaction.meta[2]}:right`,
        [interaction.values[0]]
      );
      interaction.deferUpdate();
      break;
    case "remove":
      this.db.filter(
        `${this.user.username}:${interaction.guildId}:vote:${interaction.meta[2]}:variants`,
        (v) => v !== interaction.values[0]
      );
      interaction.reply({
        content: `\`${interaction.values[0]}\` - варіант був видаленний`,
        ephemeral: true,
      });
      break;
    case "add":
      // add var
      if (
        (
          await this.db.get(
            `${this.user.username}:${interaction.guildId}:vote:${interaction.message.id}:variants`
          )
        )?.length >= 15
      ) {
        interaction.reply({
          content: "Вже максимальна кількість варіантів",
          ephemeral: true,
        });
        return;
      }
      try {
        await interaction.showModal({
          title: "Варіант відповіді",
          custom_id: `${interaction.meta[0]}:${interaction.meta[1]}`,
          components: [
            {
              type: 1,
              components: [
                {
                  type: 4,
                  custom_id: "text",
                  label: "Напишіть варіант відповіді",
                  style: 2,
                  min_length: 1,
                  max_length: 80,
                  required: true,
                },
              ],
            },
          ],
        });
      } catch (error) {}
      break;
    case "vote":
      const variants_ = await this.db.get(
        `${this.user.username}:${interaction.guildId}:vote:${interaction.meta[2]}:variants`
      );
      const params =
        (await this.db.get(
          `${this.user.username}:${interaction.guildId}:vote:${interaction.meta[2]}:userLimit`
        )) || {};
      const votes =
        (await this.db.get(
          `${this.user.username}:${interaction.guildId}:vote:${interaction.meta[2]}:votes`
        )) || [];
      // get right if exist
      const right = await this.db.get(
        `${this.user.username}:${interaction.guildId}:vote:${interaction.meta[2]}:right`
      );
      if (votes.length <= 0) {
        for (let i = 0; i < variants_.length; i++) votes.push([]);
      } else {
        for (let i = 0; i < variants_.length; i++) {
          if (votes[i] && votes[i].includes(interaction.user.id)) {
            await interaction.reply({
              content: `Ви вже вибрали варіант \`${variants_[i]}\``,
              ephemeral: true,
            });
            return;
          }
        }
      }

      if (right) {
        if (right[0] === variants_[interaction.meta[3]]) {
          const stats =
            (await this.db.get(
              `${this.user.username}:${interaction.guildId}:stats`
            )) || {};
          if (stats[interaction.user.id]) {
            stats[interaction.user.id] += 1;
          } else {
            stats[interaction.user.id] = 1;
          }
          await this.db.set(
            `${this.user.username}:${interaction.guildId}:stats`,
            stats
          );
        }
      }

      votes[Number(interaction.meta[3])].push(interaction.user.id);

      await this.db.setArray(
        `${this.user.username}:${interaction.guildId}:vote:${interaction.meta[2]}:votes`,
        votes
      );
      try {
        await interaction.deferUpdate();
      } catch (error) {}

      if (params.users) {
        let usrs = 1;
        votes.forEach((e) => (usrs += e.length));

        usrs >= params.users &&
          close.call(this, {
            guildId: interaction.guildId,
            voteId: interaction.meta[2],
            channelId: interaction.channel.id,
            messageId: interaction.message.id,
          });
      }
      break;
    default:
      interaction.reply({ content: "Невідома команда", ephemeral: true });
      break;
  }
};

module.exports.modal = async function (interaction) {
  switch (interaction.meta[1]) {
    case "add":
      try {
        const text = interaction.fields.getTextInputValue("text");
        const variants = await this.db.get(
          `${this.user.username}:${interaction.guildId}:vote:${interaction.message.id}:variants`
        );
        if (variants?.includes(text)) {
          try {
            interaction.deferUpdate();
          } catch (error) {}
          return;
        }
        this.db.push(
          `${this.user.username}:${interaction.guildId}:vote:${interaction.message.id}:variants`,
          text
        );
        interaction.deferUpdate();
      } catch (error) {
        this.log(error);
      }
      break;
    case "publish":
      const exist = await this.db.get(`${this.user.username}:loop`) || [];
      for (const task of exist) {
        if (!task) break;
        const {guildId, channelId, voteId, messageId} = task
        if (guildId == interaction.guildId && channelId == interaction.channel.id) {
          if (voteId == interaction.meta[2] || messageId == interaction.id) {
           return 
          }          
        }
      }

      let time = Number(interaction.fields.fields.get("time")?.value) || false;
      const users =
        Number(interaction.fields.fields.get("users")?.value) || false;
      const params = await this.db.get(
        `${this.user.username}:${interaction.guildId}:vote:${interaction.meta[2]}:variants`
      );
      const embeds = await this.db.get(
        `${this.user.username}:${interaction.guildId}:vote:${interaction.meta[2]}:embed`
      );
      // publish
      embeds[0].footer.text = `Обмеження ${!time && !users ? "вимкнуто" : ":"}`;
      if (time) {
        time *= 1000;
        let timeString = `\n -`;
        const date = time.msToDate();

        for (const key in date) {
          if (date[key]) {
            switch (key) {
              case "y":
                timeString +=
                  " " +
                  date[key].declension({
                    one: "рік",
                    few: "роки",
                    many: "років",
                  });
                break;
              case "d":
                timeString +=
                  " " +
                  date[key].declension({
                    one: "день",
                    few: "дня",
                    many: "днів",
                  });
                break;
              case "h":
                timeString +=
                  " " +
                  date[key].declension({
                    one: "година",
                    few: "години",
                    many: "годин",
                  });
                break;
              case "m":
                timeString +=
                  " " +
                  date[key].declension({
                    one: "хвилина",
                    few: "хвилини",
                    many: "хвилин",
                  });
                break;
              case "s":
                timeString +=
                  " " +
                  date[key].declension({
                    one: "секунда",
                    few: "секунди",
                    many: "секунд",
                  });
                break;
            }
          }
        }
        embeds[0].footer.text += timeString;
      }
      if (users) embeds[0].footer.text += "\n - " + users.declension();
      const components = [];

      const l = params.length / 5;
      const t = Math.trunc(params.length / 5);
      const s = l > t ? t + 1 : t;

      for (let i = 0; i < s; i++) {
        const nr = {
          type: 1,
          components: [],
        };
        const stp = i * 5;
        for (let j = stp; j <= stp + 4; j++) {
          if (j >= params.length) break;
          nr.components.push({
            type: 2,
            label: params[j],
            emoji: "📄",
            style: 2,
            custom_id: `${interaction.meta[0]}:vote:${interaction.meta[2]}:${j}`,
          });
        }
        components.push(nr);
      }
      await interaction.deferUpdate();
      const msg = await interaction.channel.send({
        embeds: [embeds["0"]],
        components,
      });
      // set default
      if (!users && !time) {
        time = EX;
      }
      // save to db
      if (users) {
        await this.db.set(
          `${this.user.username}:${interaction.guildId}:vote:${interaction.meta[2]}:userLimit`,
          { users }
        );
      }
      // set interval to close
      if (time) {
        time > MAX_TIME && (time = MAX_TIME)
        await this.db.push(`${this.user.username}:loop`, {
          guildId: interaction.guildId,
          channelId: interaction.channel.id,
          voteId: interaction.meta[2],
          messageId: msg.id,
          time,
          startOn: new Date().getTime(),
        });
      }
      break;
    default:
      interaction.reply({ content: "Невідома команда", ephemeral: true });
      break;
  }
};

module.exports.close = close;
