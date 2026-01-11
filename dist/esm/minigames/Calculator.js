import { ComponentType, ContainerBuilder, EmbedBuilder, LabelBuilder, MessageFlags, ModalBuilder, TextDisplayBuilder, TextInputBuilder, TextInputStyle, } from "discord.js";
import { evaluate, format } from "mathjs";
const Calculator = async (weky, options) => {
    const context = options.context;
    let str = " ";
    let stringify = "```\n" + str + "\n```";
    const text = [
        "DC",
        "RND",
        "SIN",
        "COS",
        "TAN",
        "^",
        "LG",
        "LN",
        "(",
        ")",
        "SQRT",
        "AC",
        "⌫",
        "%",
        "÷",
        "x!",
        "7",
        "8",
        "9",
        "x",
    ];
    const text2 = ["1/x", "4", "5", "6", " - ", "π", "1", "2", "3", " + ", "ans", "e", "0", ".", "="];
    let disabled = true;
    let lastInput;
    const handleModalInput = async (interact, modalId, operation) => {
        const modal = new ModalBuilder().setTitle(modalId).setCustomId(`md${modalId}`);
        const input = new TextInputBuilder()
            .setCustomId(`number${modalId}`)
            .setStyle(TextInputStyle.Short)
            .setRequired(true);
        const label = new LabelBuilder().setLabel(`Enter the number for ${operation}`).setTextInputComponent(input);
        const text = new TextDisplayBuilder().setContent(`## Current Calculation Prompt:\n${str === " " ? "```No Prompt Yet```" : stringify}`);
        modal.addTextDisplayComponents(text).addLabelComponents(label);
        await interact.showModal(modal);
        return new Promise((resolve) => {
            const modalHandler = async (modal) => {
                if (!modal.isModalSubmit() || modal.customId !== `md${modalId}`)
                    return;
                weky._client.off("interactionCreate", modalHandler);
                await modal.deferUpdate();
                resolve(modal.fields.getTextInputValue(`number${modalId}`));
            };
            weky._client.on("interactionCreate", modalHandler);
            setTimeout(() => weky._client.off("interactionCreate", modalHandler), 300000);
        });
    };
    const handleCalculation = (input) => {
        try {
            const result = evaluate(input);
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
                if (Math.abs(result) > 1e15) {
                    return { result: null, error: "Result too large to display" };
                }
            }
            return { result, error: null };
        }
        catch (e) {
            return { result: null, error: options.invalidQuery || "Invalid calculation" };
        }
    };
    const channel = context.channel;
    const createCalculatorContainer = (displayText, buttonsEnabled, lock) => {
        const container = new ContainerBuilder()
            .setAccentColor(typeof options.embed.color === "number" ? options.embed.color : 0x5865f2)
            .addTextDisplayComponents((textDisplay) => textDisplay.setContent(displayText));
        for (let i = 0; i < text.length; i += 5) {
            const rowButtons = text
                .slice(i, i + 5)
                .map((text) => (buttonsEnabled ? weky._createButton(text, false) : weky._createDisabledButton(text, lock)));
            container.addActionRowComponents((actionRow) => actionRow.setComponents(...rowButtons));
        }
        return container;
    };
    const createCalculatorContainer2 = (buttonsEnabled, lock) => {
        const container = new ContainerBuilder().setAccentColor(typeof options.embed.color === "number" ? options.embed.color : 0x5865f2);
        for (let i = 0; i < text2.length; i += 5) {
            const rowButtons = text2
                .slice(i, i + 5)
                .map((text) => (buttonsEnabled ? weky._createButton(text, false) : weky._createDisabledButton(text, lock)));
            container.addActionRowComponents((actionRow) => actionRow.setComponents(...rowButtons));
        }
        return container;
    };
    const msg = await context.channel.send({
        components: [createCalculatorContainer(stringify, true, false)],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { repliedUser: false },
    });
    const msg2 = await context.channel.send({
        components: [createCalculatorContainer2(true, false)],
        flags: MessageFlags.IsComponentsV2,
    });
    async function edit() {
        await msg.edit({
            components: [createCalculatorContainer(stringify, !disabled, false)],
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: { repliedUser: false },
        });
    }
    async function edit2() {
        if (msg2.editable) {
            await msg2.edit({
                components: [createCalculatorContainer2(!disabled, false)],
                flags: MessageFlags.IsComponentsV2,
            });
        }
    }
    async function lock() {
        await msg.edit({
            components: [createCalculatorContainer(stringify, false, true)],
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: { repliedUser: false },
        });
        if (msg2.editable) {
            await msg2.edit({
                components: [createCalculatorContainer2(false, true)],
                flags: MessageFlags.IsComponentsV2,
            });
        }
    }
    let id = weky._getContextUserID(context);
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
        if (interact.customId !== "calLG" &&
            interact.customId !== "calSQRT" &&
            interact.customId !== "calRND" &&
            interact.customId !== "calSIN" &&
            interact.customId !== "calCOS" &&
            interact.customId !== "calTAN" &&
            interact.customId !== "calLN" &&
            interact.customId !== "cal1/x" &&
            interact.customId !== "calx!")
            await interact.deferUpdate();
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
                if (str.slice(0, -1) === " " ||
                    str.slice(0, -1) === "" ||
                    str.slice(0, -1) === null ||
                    str.slice(0, -1) === undefined) {
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
                    answer = format(result, { precision: 14 });
                    str += " = " + result;
                }
                else {
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
        }
        else if (((disabled === false && lastInput === null) || lastInput === undefined) &&
            interact.customId !== "calDC") {
            disabled = true;
        }
    });
    calc.on("end", async () => {
        str = "Calculator has been stopped";
        stringify = "```\n" + str + "\n```";
        edit();
        edit2();
        lock();
    });
};
export default Calculator;
