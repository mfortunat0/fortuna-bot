import "dotenv/config";
import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

const APP_ID =
  process.env.NODE_ENV === "production"
    ? process.env.APP_ID
    : process.env.APP_ID_TEST;

const GUILD_ID =
  process.env.NODE_ENV === "production"
    ? process.env.GUILD_ID
    : process.env.GUILD_ID_TEST;

const TOKEN =
  process.env.NODE_ENV === "production"
    ? process.env.TOKEN
    : process.env.TOKEN_TEST;

const commands = [
  new SlashCommandBuilder()
    .setName("js-beginner")
    .setDescription("Exercicio aleatorio javascript nivel facil"),
  new SlashCommandBuilder()
    .setName("js-intermediate")
    .setDescription("Exercicio aleatorio javascript nivel intermediario"),
  new SlashCommandBuilder()
    .setName("js-advanced")
    .setDescription("Exercicio aleatorio javascript nivel avançado"),
  new SlashCommandBuilder()
    .setName("html")
    .setDescription("Exercicio aleatorio sobre HTML"),
].map((command) => command.toJSON());

const rest = new REST({ version: "9" }).setToken(TOKEN);

rest
  .put(Routes.applicationGuildCommands(APP_ID, GUILD_ID), {
    body: commands,
  })
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error);
