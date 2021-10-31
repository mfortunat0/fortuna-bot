import "dotenv/config";
import { readFile } from "fs/promises";
import { join } from "path";
import { Client, Intents, Interaction, Message } from "discord.js";

type QuestionFile = {
  id: number;
  question: string;
  text: string;
  correct: string;
  alternatives: string[];
};

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});

const getAllQuestionsBegginer = async () => {
  const fileContent = await readFile(
    join(__dirname, "..", "json", "begginerQuestions.json")
  );
  return JSON.parse(fileContent.toString()) as QuestionFile[];
};

const getAllQuestionsIntermediate = async () => {
  const fileContent = await readFile(
    join(__dirname, "..", "json", "intermediateQuestions.json")
  );
  return JSON.parse(fileContent.toString()) as QuestionFile[];
};

const formateQuestion = (
  id: number,
  text: string,
  question: string,
  alternatives: string[],
  dificult: string
) => {
  return `**Questão: ${id}** | ${dificult} \n
  ${question}${text ? "\n```js" : ""}${text ? "\n" + text : ""}${
    text ? "\n```" : ""
  }
  **1️**: ${alternatives[0]}
  **2️**: ${alternatives[1]}
  **3️**: ${alternatives[2]}
  **4️**: ${alternatives[3]}
  
  Reaja com a opção desejada. `;
};

const reactWithEmojis = async (message: Message) => {
  await message.react("1️⃣");
  await message.react("2️⃣");
  await message.react("3️⃣");
  await message.react("4️⃣");
};

const generateQuestion = async (dificult: string, interaction: Interaction) => {
  let questions: QuestionFile[];
  if (dificult === "Begginer") questions = await getAllQuestionsBegginer();
  if (dificult === "Intermediate")
    questions = await getAllQuestionsIntermediate();

  const randomQuest =
    Math.floor(Math.random() * (questions.length - 1 - 0)) + 0;
  const { id, text, question, alternatives } = questions[randomQuest];
  const formattedQuestion = formateQuestion(
    id,
    text,
    question,
    alternatives,
    dificult
  );
  //@ts-ignore
  const message: Message = await interaction.reply({
    content: formattedQuestion,
    fetchReply: true,
  });
  reactWithEmojis(message);
};

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === "js-beginner") {
    generateQuestion("Begginer", interaction);
  } else if (commandName === "js-intermediate") {
    generateQuestion("Intermediate", interaction);
  }
});

client.on("messageReactionAdd", async (msg, user) => {
  const author = msg.message.author.username;
  const options = ["1️⃣", "2️⃣", "3️⃣", "4️⃣"];
  const emoji = msg.emoji.name;

  if (
    author === "fortuna-bot" &&
    options.includes(emoji) &&
    user.username !== "fortuna-bot"
  ) {
    const messageContent = msg.message.content;
    const dificult = messageContent.split(" ")[3];
    let questions: QuestionFile[];

    if (dificult === "Begginer") questions = await getAllQuestionsBegginer();
    if (dificult === "Intermediate")
      questions = await getAllQuestionsIntermediate();

    const id = Number(messageContent.split(" ")[1].replace("**", ""));

    if (`${questions[id - 1].correct}` === `${emoji}`) {
      user.send(
        `Parabéns você acertou a questão N° ${id} na dificuldade ${dificult}`
      );
    } else {
      user.send(
        `Sinto muito, você errou a questão N° ${id} na dificuldade ${dificult}  `
      );
    }
  }
});

client.login(process.env.TOKEN);
