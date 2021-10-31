import "dotenv/config";
import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

const commands = [
  new SlashCommandBuilder()
    .setName("js-beginner")
    .setDescription("Exercicio aleatorio javascript nivel facil"),
  new SlashCommandBuilder()
    .setName("js-intermediate")
    .setDescription("Exercicio aleatorio javascript nivel intermediario"),
].map((command) => command.toJSON());

const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

rest
  .put(
    Routes.applicationGuildCommands(process.env.APP_ID, process.env.GUILD_ID),
    {
      body: commands,
    }
  )
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error);
