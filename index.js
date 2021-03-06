// @ts-check
import dotenv from 'dotenv';
dotenv.config();

import { Client, Emoji, GuildMemberRoleManager, Intents, MessageActionRow, MessageEmbed, MessageSelectMenu, Permissions } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

export const createMenuCommand = new SlashCommandBuilder() /// der Command, der 
    .setName('addselectrole')
    .setDescription('Mach das, wozu dieser Bot da ist')
    .addRoleOption(builder => builder.setName('rolle_a_klasse').setRequired(true).setDescription('Rolle der A-Klasse'))
    .addRoleOption(builder => builder.setName('rolle_b_klasse').setRequired(true).setDescription('Rolle der B-Klasse'))
    .addRoleOption(builder => builder.setName('rolle_c_klasse').setRequired(true).setDescription('Rolle der C-Klasse'))
    .addIntegerOption(builder => builder
        .addChoices([['1', 1], ['2', 2], ['3', 3], ['4', 4], ['5', 5]])
        .setName('jahrgang')
        .setDescription('Die wievielte Klasse es ist (zur Zeit des Schreibens 2)')
        .setRequired(true)
    )
    .addRoleOption(builder => builder.setName('removerole').setDescription('Rolle die beim Auswählen einer Option weggenommen werden soll'))
    .addRoleOption(builder => builder.setName('addrole').setDescription('Rolle die beim Auswählen irgendeiner Option hinzugefügt werden soll'))





client.once('ready', () => {
    console.log(`I am ready! Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand()) {
        if (interaction.commandName != 'addselectrole' || interaction.user.bot) return;

        // @ts-expect-error
        if (!interaction.member.permissions.has?.(Permissions.FLAGS.ADMINISTRATOR))
            return interaction.reply(
                {
                    ephemeral: true,
                    content: 'Du hast leider nicht die nötigen Rechte, um diesen Command auszuführen :('
                });

        try {

            const rolle_a_klasse = interaction.options.getRole('rolle_a_klasse', true);
            const rolle_b_klasse = interaction.options.getRole('rolle_b_klasse', true);
            const rolle_c_klasse = interaction.options.getRole('rolle_c_klasse', true);
            const removeRole = interaction.options.getRole('removerole', false);
            const addRole = interaction.options.getRole('addrole', false);
            const jahrgang = interaction.options.getInteger('jahrgang', true);

            const selectMenu = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId(`selectRole:${removeRole ? removeRole.id : ''}:${addRole ? addRole.id : ''}`)
                        .setPlaceholder('Wähle deine Klasse aus!')
                        .addOptions([
                            {
                                label: `${jahrgang}AI`,
                                description: `Wähle dies aus, wenn du in der ${jahrgang}AI bist`,
                                value: `selectRole:${rolle_a_klasse.id}`,
                                emoji: '🇦'
                            },
                            {
                                label: `${jahrgang}BI`,
                                description: `Wähle dies aus, wenn du in der ${jahrgang}BI bist`,
                                value: `selectRole:${rolle_b_klasse.id}`,
                                emoji: '🇧'

                            },
                            {
                                label: `${jahrgang}CI`,
                                description: `Wähle dies aus, wenn du in der ${jahrgang}CI bist`,
                                value: `selectRole:${rolle_c_klasse.id}`,
                                emoji: '🇨'
                            }
                        ]),
                );

            await interaction.channel.send(
                {
                    embeds: [new MessageEmbed()
                        .setDescription('Wähle deine Klasse aus!')
                        .setColor('#88C801')],
                    components: [selectMenu]
                });

            await interaction.reply({ content: 'Du hast erfolgreich eine Klassenauswahl erstellt. Um sie zu Löschen, lösche einfach die Nachricht des Bots.', ephemeral: true });

        } catch (err) {
            const date = new Date();
            console.error(`${date.toLocaleDateString()}, ${date.toLocaleTimeString()}:`, err);
            interaction[interaction.replied ? 'followUp' : 'reply']({ ephemeral: true, content: 'Beim Senden der Auswahl-Nachricht ist ein Fehler aufgetreten. Bitte stelle sicher, dass der Bot entsprechende Rechte hat.'})
        }
    } else if (interaction.isSelectMenu()) {
        const { user, member, customId, component, guild } = interaction;
        try {
            // @ts-expect-error // component ist auf jeden Fall ein Select-Menu, das weiß TS aber nicht
            const componentId = component.customId;

            const [, removeRoleId, addRoleId] = componentId.split(':');;
            // @ts-expect-error // das selbe problem
            const [rolleA, rolleB, rolleC] = interaction.component.options.map(val => guild.roles.cache.get(val.value.split(':')[1]));
            const selectedRolle = guild.roles.cache.get(interaction.values[0].split(':')[1]);

            // @ts-expect-error
            await member.roles.remove([rolleA.id, rolleB.id, rolleC.id], 'Klassen-Auswahl: Entfernen von allen in der Auswahl vorkommenden Rollen');

            // @ts-expect-error
            await member.roles.add(selectedRolle, `Klassen-Auswahl: Hinzufügen der ausgewählten Rolle (${selectedRolle.name})`);

            // @ts-expect-error
            if (removeRoleId) await member.roles.remove(removeRoleId, `Klassen-Auswahl: Entfernen der zu entfernenden Rolle`);
            // @ts-expect-error
            if (addRoleId) await member.roles.add(addRoleId, `Klassen-Auswahl: Hinzufügen der Rolle, die unabhängig von der Auswahl hinzugefügt wird`);

            await interaction.reply({ ephemeral: true, content: 'Klasse erfolgreich ausgewählt :)' });
        } catch (err) {
            interaction.reply({ ephemeral: true, content: 'Beim Auswählen der Klasse ist leider ein Fehler aufgetreten, bitte kontaktiere einen Admin oder <@532248236681986048>.' })
            const date = new Date();
            console.error(`${date.toLocaleDateString()}, ${date.toLocaleTimeString()}:`, err);
        }
    }
});

// Einloggen (mit dem Token)
client.login(process.env.TOKEN);