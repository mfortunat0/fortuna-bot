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
  category: string
) => {
  return `**Questão: ${id}** | ${category}\n
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

const generateQuestion = async (
  category: string,
  interaction: Interaction | Message
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
    category
  );
  //@ts-ignore
  const message: Message = await interaction.reply({
    content: formattedQuestion,
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
    generateQuestion("Beginner Javascript", interaction);
  } else if (commandName === "js-intermediate") {
    generateQuestion("Intermediate Javascript", interaction);
  } else if (commandName === "js-advanced") {
    generateQuestion("Advanced Javascript", interaction);
  } else if (commandName === "html") {
    generateQuestion("HTML", interaction);
  }
});

client.on("messageCreate", (message) => {
  if (message.content[0] === "/") {
    const commandName = message.content.replace("/", "");

    if (commandName === "js-beginner") {
      generateQuestion("Beginner Javascript", message);
    } else if (commandName === "js-intermediate") {
      generateQuestion("Intermediate Javascript", message);
    } else if (commandName === "js-advanced") {
      generateQuestion("Advanced Javascript", message);
    } else if (commandName === "html") {
      generateQuestion("HTML", message);
    }
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
    const category = messageContent.split(" ")[3].trim();
    let questions: QuestionFile[];

    if (category === "Beginner") {
      questions = await getAllQuestionsBeginner();
    }
    if (category === "Intermediate") {
      questions = await getAllQuestionsIntermediate();
    }
    if (category === "Advanced") {
      questions = await getAllQuestionsAdvanced();
    }
    if (category === "HTML") {
      questions = await getAllQuestionsHtml();
    }

    const id = Number(messageContent.split(" ")[1].replace("**", ""));

    if (`${questions[id - 1].correct}` === `${emoji}`) {
      user.send(`Parabéns você acertou a questão **N° ${id}** em ${category}`);
    } else {
      user.send(
        `Sinto muito, você errou a questão **N° ${id}** em ${category}  `
      );
    }
  }
});

client.login(process.env.TOKEN);
