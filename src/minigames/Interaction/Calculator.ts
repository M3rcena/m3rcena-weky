import chalk from "chalk";
import { ActionRowBuilder, ButtonBuilder, Client, ComponentType, ContainerBuilder, EmbedBuilder, MessageFlags, ModalBuilder, ModalSubmitInteraction, TextDisplayBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { evaluate } from "mathjs";

import { checkPackageUpdates, createButton, createDisabledButton } from "../../functions/functions.js";
import { OptionsChecking } from "../../functions/OptionChecking.js";

import type { CalcTypes } from "../../Types";

const Calculator = async (options: CalcTypes) => {
  // Validate calculator options
  OptionsChecking(options, "Calculator");

  let interaction = options.interaction;

  if (!interaction) throw new Error(chalk.red("[@m3rcena/weky] Calculator Error:") + " No interaction provided.");

  let client: Client = options.client;

  let str = " ";
  let stringify = "```\n" + str + "\n```";

  const text = ["DC", "RND", "SIN", "COS", "TAN", "^", "LG", "LN", "(", ")", "SQRT", "%", "÷", "AC", "⌫", "x!", "7", "8", "9", "x"];

  const text2 = ["1/x", "4", "5", "6", " - ", "π", "1", "2", "3", " + ", "ans", "e", "0", ".", "="];

  let disabled: boolean = true;
  let lastInput: string | null | undefined;

  // Handle modal inputs for special operations (log, sin, etc.)
  const handleModalInput = async (interact: any, modalId: string, operation: string) => {
    const modal = new ModalBuilder().setTitle(modalId).setCustomId(`md${modalId}`);

    const input = new TextInputBuilder().setCustomId(`number${modalId}`).setLabel(`Enter the number for ${operation}`).setStyle(TextInputStyle.Short).setRequired(true);

    modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
    await interact.showModal(modal);

    return new Promise((resolve) => {
      const modalHandler = async (modal: ModalSubmitInteraction) => {
        if (!modal.isModalSubmit() || modal.customId !== `md${modalId}`) return;

        client.off("interactionCreate", modalHandler);
        await modal.deferUpdate();
        resolve(modal.fields.getTextInputValue(`number${modalId}`));
      };

      client.on("interactionCreate", modalHandler);
      setTimeout(() => client.off("interactionCreate", modalHandler), 300000);
    });
  };

  // Process calculations using mathjs
  const handleCalculation = (input: string) => {
    try {
      const result = evaluate(input);

      // Handle special cases
      if (typeof result === "number") {
        if (isNaN(result)) {
          return { result: null, error: "Invalid calculation (NaN)" };
        }
        if (!isFinite(result)) {
          if (result === Infinity) {
            return { result: null, error: "Result too large (∞)" };
          }
          if (result === -Infinity) {
            return { result: null, error: "Result too small (-∞)" };
          }
          return { result: null, error: "Result is infinite" };
        }
        // Check if result is extremely large (more than 15 digits)
        if (Math.abs(result) > 1e15) {
          return { result: null, error: "Result too large to display" };
        }
      }

      return { result, error: null };
    } catch (e) {
      return { result: null, error: options.invalidQuery || "Invalid calculation" };
    }
  };

  // Set up calculator display using Components V2
  if (!interaction.channel || !interaction.channel.isTextBased() || !interaction.channel.isSendable()) {
    throw new Error(chalk.red("[@m3rcena/weky] Calculator Error:") + " Interaction must be a text-based channel.");
  }

  const channel = interaction.channel;

  // Create Components V2 structure
  const createCalculatorContainer = (displayText: string, buttonsEnabled: boolean) => {
    const container = new ContainerBuilder()
      .setAccentColor(typeof options.embed.color === "number" ? options.embed.color : 0x5865f2) // Use embed color or default blurple
      .addTextDisplayComponents((textDisplay) => textDisplay.setContent(displayText));

    // First container: text array buttons (25 buttons = 5 rows)
    for (let i = 0; i < text.length; i += 5) {
      const rowButtons = text.slice(i, i + 5).map((text) => (buttonsEnabled ? createButton(text, false) : createDisabledButton(text)));
      container.addActionRowComponents((actionRow) => actionRow.setComponents(...rowButtons));
    }

    return container;
  };

  const createCalculatorContainer2 = (buttonsEnabled: boolean) => {
    const container = new ContainerBuilder()
      .setAccentColor(typeof options.embed.color === "number" ? options.embed.color : 0x5865f2) // Use embed color or default blurple
      .addTextDisplayComponents((textDisplay) => textDisplay.setContent("\u200B")); // Invisible content using Zero Width Space

    // Second container: text2 array buttons (15 buttons = 3 rows)
    for (let i = 0; i < text2.length; i += 5) {
      const rowButtons = text2.slice(i, i + 5).map((text) => (buttonsEnabled ? createButton(text, false) : createDisabledButton(text)));
      container.addActionRowComponents((actionRow) => actionRow.setComponents(...rowButtons));
    }

    return container;
  };

  const msg = await interaction.editReply({
    components: [createCalculatorContainer(stringify, true)],
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: { repliedUser: false },
  });

  // Send second message with additional buttons
  const msg2 = await interaction.followUp({
    components: [createCalculatorContainer2(true)],
    flags: MessageFlags.IsComponentsV2,
  });

  // Calculator logic
  async function edit() {
    if (msg.editable) {
      await msg.edit({
        components: [createCalculatorContainer(stringify, !disabled)],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { repliedUser: false },
      });
    } else {
      await interaction.editReply({
        content: `An error occured while trying to edit the calculator.`,
      });
    }
  }

  async function edit2() {
    if (msg2.editable) {
      await msg2.edit({
        components: [createCalculatorContainer2(!disabled)],
        flags: MessageFlags.IsComponentsV2,
      });
    }
  }

  async function lock(disabled: boolean) {
    if (msg.editable) {
      await msg.edit({
        components: [createCalculatorContainer(stringify, false)],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { repliedUser: false },
      });
    } else {
      await interaction.editReply({
        content: `An error occured while trying to lock the calculator.`,
      });
    }
    if (msg2.editable) {
      await msg2.edit({
        components: [createCalculatorContainer2(false)],
        flags: MessageFlags.IsComponentsV2,
      });
    }
  }

  let id = interaction.user.id;
  const calc = channel.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 300000,
  });

  let answer = "0";
  calc.on("collect", async (interact) => {
    if (interact.user.id !== id) {
      return interact.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(options.embed.title ? options.embed.title : "Error | Weky Calculator")
            .setDescription(`You are not allowed to interact with this calculator as you are not the user who initiated the command.\n\n**Note:** This calculator is only for the user <@${id}>`)
            .setColor("Red")
            .setTimestamp(options.embed.timestamp ? new Date() : null),
        ],
        flags: [MessageFlags.Ephemeral],
      });
    }

    if (interact.customId !== "calLG" && interact.customId !== "calSQRT" && interact.customId !== "calRND" && interact.customId !== "calSIN" && interact.customId !== "calCOS" && interact.customId !== "calTAN" && interact.customId !== "calLN" && interact.customId !== "cal1/x" && interact.customId !== "calx!") await interact.deferUpdate();

    switch (interact.customId) {
      case "calAC":
        lastInput = null;
        str = " ";
        stringify = "```\n" + str + "\n```";
        edit();
        edit2();
        break;

      case "calx":
        lastInput = interact.customId;
        str += " * ";
        stringify = "```\n" + str + "\n```";
        edit();
        edit2();
        break;

      case "cal÷":
        lastInput = interact.customId;
        str += " / ";
        stringify = "```\n" + str + "\n```";
        edit();
        edit2();
        break;

      case "cal⌫":
        if (str === " " || str === "" || str === null || str === undefined) {
          lastInput = null;
          return;
        }
        lastInput = interact.customId;
        if (str.slice(0, -1) === " " || str.slice(0, -1) === "" || str.slice(0, -1) === null || str.slice(0, -1) === undefined) {
          lastInput = null;
        }
        str = str.slice(-1) === " " ? str.slice(0, -3) : str.slice(0, -1);
        stringify = "```\n" + str + "\n```";
        edit();
        edit2();
        break;

      case "cal=":
        lastInput = null;
        if (str === " " || str === "" || str === null || str === undefined) {
          return;
        }
        const { result, error } = handleCalculation(str);
        if (result !== null) {
          answer = result;
          str += " = " + result;
          stringify = "```\n" + str + "\n```";
          edit();
          edit2();
          str = " ";
          stringify = "```\n" + str + "\n```";
        } else {
          str = error;
          answer = "0";
        }
        stringify = "```\n" + str + "\n```";
        edit();
        edit2();
        str = " ";
        stringify = "```\n" + str + "\n```";
        break;

      case "calLG":
      case "calSQRT":
      case "calRND":
      case "calSIN":
      case "calCOS":
      case "calTAN":
      case "calLN":
      case "cal1/x":
      case "calx!": {
        const operationMap = {
          calLG: ["Log", "logarithm 10", "log10"],
          calSQRT: ["Sqrt", "square root", "sqrt"],
          calRND: ["Rnd", "round", "round"],
          calSIN: ["Sin", "sine", "sin"],
          calCOS: ["Cos", "cosine", "cos"],
          calTAN: ["Tan", "tangent", "tan"],
          calLN: ["Ln", "natural logarithm", "log"],
          "cal1/x": ["Reciprocal", "reciprocal", "1/"],
          "calx!": ["Factorial", "factorial", "!"],
        };

        const [modalTitle, operation, func] = operationMap[interact.customId];
        const number = await handleModalInput(interact, modalTitle, operation);
        if (number) {
          str += func === "!" ? number + func : `${func}(${number})`;
          stringify = "```\n" + str + "\n```";
          lastInput = interact.customId;
          edit();
          edit2();
        }
        break;
      }

      case "calπ":
        lastInput = interact.customId;
        str += "pi";
        stringify = "```\n" + str + "\n```";
        edit();
        edit2();
        break;

      case "cale":
        lastInput = interact.customId;
        str += "e";
        stringify = "```\n" + str + "\n```";
        edit();
        edit2();
        break;

      case "calans":
        lastInput = interact.customId;
        str += `${answer}`;
        stringify = "```\n" + str + "\n```";
        edit();
        edit2();
        break;

      case "calDC":
        calc.stop();
        break;

      default:
        lastInput = interact.customId;
        str += interact.customId.replace("cal", "");
        stringify = "```\n" + str + "\n```";
        edit();
        edit2();
        break;
    }

    if (disabled === true && lastInput !== null && lastInput !== undefined) {
      disabled = false;
    } else if (((disabled === false && lastInput === null) || lastInput === undefined) && interact.customId !== "calDC") {
      disabled = true;
    }
  });

  calc.on("end", async () => {
    str = "Calculator has been stopped";
    stringify = "```\n" + str + "\n```";
    edit();
    edit2();
    lock(true);
  });

  // Check for package updates
  checkPackageUpdates("Calculator", options.notifyUpdate);
};

export default Calculator;
