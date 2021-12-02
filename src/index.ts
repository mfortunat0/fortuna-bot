import "dotenv/config";
import { readFile } from "fs/promises";
import { join } from "path";
import express from "express";
import {
  Client,
  Intents,
  Interaction,
  Message,
  MessageAttachment,
  MessageEmbed,
} from "discord.js";

type QuestionFile = {
  id: number;
  question: string;
  text: string;
  correct: string;
  alternatives: string[];
};

const app = express();

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});

const TOKEN =
  process.env.NODE_ENV === "production"
    ? process.env.TOKEN
    : process.env.TOKEN_TEST;

const fortunaProfile = new MessageAttachment("./assets/fortuna.jpeg");
const dotJsProfile = new MessageAttachment("./assets/dotjs.jpg");

const getAllQuestionsBeginner = async () => {
  const fileContent = await readFile(
    join(__dirname, "..", "json", "jsBeginnerQuestions.json")
  );
  return JSON.parse(fileContent.toString()) as QuestionFile[];
};

const getAllQuestionsIntermediate = async () => {
  const fileContent = await readFile(
    join(__dirname, "..", "json", "jsIntermediateQuestions.json")
  );
  return JSON.parse(fileContent.toString()) as QuestionFile[];
};

const getAllQuestionsAdvanced = async () => {
  const fileContent = await readFile(
    join(__dirname, "..", "json", "jsAdvancedQuestions.json")
  );
  return JSON.parse(fileContent.toString()) as QuestionFile[];
};

const getAllQuestionsHtml = async () => {
  const fileContent = await readFile(
    join(__dirname, "..", "json", "htmlQuestions.json")
  );
  return JSON.parse(fileContent.toString()) as QuestionFile[];
};

const formateQuestion = (
  id: number,
  text: string,
  question: string,
  alternatives: string[],
  commandName: string,
  category: string
) => {
  const markdownType = commandName.split("-")[0];
  const exampleEmbed = new MessageEmbed()
    .setAuthor("Fortuna-bot", "attachment://fortuna.jpeg")
    .setColor("#fdd54f")
    .setTitle(`**Questão: ${id}**`)
    .setDescription(
      `${question}${text ? "\n```" + markdownType + "" : ""}${
        text ? "\n" + text : ""
      }${text ? "\n```" : ""}`
    )
    .setThumbnail("attachment://dotjs.jpg")
    .addFields(
      { name: "\u200B", value: "\u200B" },
      {
        name: "Como responder?",
        value: "Basta reagir com a alternativa que acredita estar certa.",
      },
      {
        name: "\u200B",
        value: `1️⃣: ${alternatives[0]}`,
      },
      {
        name: "\u200B",
        value: `2️⃣: ${alternatives[1]}`,
      },
      {
        name: "\u200B",
        value: `3️⃣: ${alternatives[2]}`,
      },
      {
        name: "\u200B",
        value: `4️⃣: ${alternatives[3]}`,
      }
    )
    .addField("\u200B", "\u200B")
    .setFooter(category, "attachment://dotjs.jpg")
    .setTimestamp();
  return exampleEmbed;
};

const reactWithEmojis = async (message: Message) => {
  await message.react("1️⃣");
  await message.react("2️⃣");
  await message.react("3️⃣");
  await message.react("4️⃣");
};

const generateQuestion = async (
  category: string,
  interaction: Interaction | Message,
  commandName: string
) => {
  let questions: QuestionFile[];
  if (category === "Beginner Javascript") {
    questions = await getAllQuestionsBeginner();
  }
  if (category === "Intermediate Javascript") {
    questions = await getAllQuestionsIntermediate();
  }
  if (category === "Advanced Javascript") {
    questions = await getAllQuestionsAdvanced();
  }
  if (category === "HTML") {
    questions = await getAllQuestionsHtml();
  }

  const randomQuest =
    Math.floor(Math.random() * (questions.length - 1 - 0)) + 0;
  const { id, text, question, alternatives } = questions[randomQuest];
  const formattedQuestion = formateQuestion(
    id,
    text,
    question,
    alternatives,
    commandName,
    category
  );

  //@ts-ignore
  const message: Message = await interaction.reply({
    embeds: [formattedQuestion],
    files: [fortunaProfile, dotJsProfile],
    fetchReply: true,
  });

  reactWithEmojis(message);

  setTimeout(() => {
    message.delete();
  }, 120000);
};

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === "js-beginner") {
    generateQuestion("Beginner Javascript", interaction, commandName);
  } else if (commandName === "js-intermediate") {
    generateQuestion("Intermediate Javascript", interaction, commandName);
  } else if (commandName === "js-advanced") {
    generateQuestion("Advanced Javascript", interaction, commandName);
  } else if (commandName === "html") {
    generateQuestion("HTML", interaction, commandName);
  }
});

client.on("messageCreate", (message) => {
  if (message.content[0] === "/") {
    const commandName = message.content.replace("/", "");

    if (commandName === "js-beginner") {
      generateQuestion("Beginner Javascript", message, commandName);
    } else if (commandName === "js-intermediate") {
      generateQuestion("Intermediate Javascript", message, commandName);
    } else if (commandName === "js-advanced") {
      generateQuestion("Advanced Javascript", message, commandName);
    } else if (commandName === "html") {
      generateQuestion("HTML", message, commandName);
    }
  }
});

client.on("messageReactionAdd", async (msg, user) => {
  const author = msg.message.author.username;
  const options = ["1️⃣", "2️⃣", "3️⃣", "4️⃣"];
  const emoji = msg.emoji.name;

  if (
    (author === "fortuna-bot" || author === "fortuna-test-bot") &&
    options.includes(emoji) &&
    user.username !== "fortuna-bot" &&
    user.username !== "fortuna-test-bot"
  ) {
    const id = Number(
      msg.message.embeds[0].title.split(" ")[1].replace("**", "")
    );
    const category = msg.message.embeds[0].footer.text;

    let questions: QuestionFile[];

    if (category === "Beginner Javascript") {
      questions = await getAllQuestionsBeginner();
    }
    if (category === "Intermediate Javascript") {
      questions = await getAllQuestionsIntermediate();
    }
    if (category === "Advanced Javascript") {
      questions = await getAllQuestionsAdvanced();
    }
    if (category === "HTML") {
      questions = await getAllQuestionsHtml();
    }

    if (`${questions[id - 1].correct}` === `${emoji}`) {
      user.send(`Parabéns você acertou a questão **N° ${id}** em ${category}`);
    } else {
      user.send(
        `Sinto muito, você errou a questão **N° ${id}** em ${category}  `
      );
    }
  }
});

client.login(TOKEN);
app.get("/", (req, res) => res.send("OK"));
app.listen(process.env.PORT || 3000);
