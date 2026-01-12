import { ComponentType, ContainerBuilder, LabelBuilder, MessageFlags, ModalBuilder, TextDisplayBuilder, TextInputBuilder, TextInputStyle, } from "discord.js";
import { evaluate, format } from "mathjs";
const MAIN_KEYS = [
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
const SEC_KEYS = ["1/x", "4", "5", "6", " - ", "π", "1", "2", "3", " + ", "ans", "e", "0", ".", "="];
const INVALID_START_KEYS = ["⌫", "AC", "=", "x", "÷", "%", "^", "x!", ")"];
const Calculator = async (weky, options) => {
    const { context, embed: embedOptions } = options;
    const authorId = weky._getContextUserID(context);
    const accentColor = typeof embedOptions.color === "number" ? embedOptions.color : 0x5865f2;
    const MODAL_OPERATIONS = {
        calLG: {
            title: options.operationTitles?.logarithm ? options.operationTitles.logarithm : "Logarithm",
            label: options.oporationLabels?.logarithm ? options.oporationLabels.logarithm : "logarithm 10",
            funcName: "log10",
        },
        calSQRT: {
            title: options.operationTitles?.squareRoot ? options.operationTitles.squareRoot : "Square Root",
            label: options.oporationLabels?.squareRoot ? options.oporationLabels.squareRoot : "square root",
            funcName: "sqrt",
        },
        calRND: {
            title: options.operationTitles?.round ? options.operationTitles.round : "Round",
            label: options.oporationLabels?.round ? options.oporationLabels.round : "round",
            funcName: "round",
        },
        calSIN: {
            title: options.operationTitles?.sine ? options.operationTitles.sine : "Sine",
            label: options.oporationLabels?.sine ? options.oporationLabels.sine : "sine",
            funcName: "sin",
        },
        calCOS: {
            title: options.operationTitles?.cosine ? options.operationTitles.cosine : "Cosine",
            label: options.oporationLabels?.cosine ? options.oporationLabels.cosine : "cosine",
            funcName: "cos",
        },
        calTAN: {
            title: options.operationTitles?.tangent ? options.operationTitles.tangent : "Tangent",
            label: options.oporationLabels?.tangent ? options.oporationLabels.tangent : "tangent",
            funcName: "tan",
        },
        calLN: {
            title: options.operationTitles?.naturalLogarithm ? options.operationTitles.naturalLogarithm : "Natural Logarithm",
            label: options.oporationLabels?.naturalLogarithm ? options.oporationLabels.naturalLogarithm : "natural logarithm",
            funcName: "log",
        },
        "cal1/x": {
            title: options.operationTitles?.reciprocal ? options.operationTitles.reciprocal : "Reciprocal",
            label: options.oporationLabels?.reciprocal ? options.oporationLabels.reciprocal : "reciprocal",
            funcName: "1/",
        },
        "calx!": {
            title: options.operationTitles?.factorial ? options.operationTitles.factorial : "Factorial",
            label: options.oporationLabels?.factorial ? options.oporationLabels.factorial : "factorial",
            funcName: "!",
            isSuffix: true,
        },
    };
    let currentExpression = " ";
    let lastAnswer = "";
    let isFinished = false;
    let hasCalculated = false;
    const getDisplay = () => `\`\`\`\n${currentExpression}\n\`\`\``;
    const calculateResult = (input) => {
        try {
            const result = evaluate(input);
            if (typeof result === "number") {
                if (isNaN(result))
                    return {
                        result: null,
                        error: options.errorMessages?.invalidCalculation
                            ? options.errorMessages.invalidCalculation
                            : "Invalid calculation (NaN)",
                    };
                if (!isFinite(result))
                    return {
                        result: null,
                        error: options.errorMessages?.infiniteResult ? options.errorMessages.infiniteResult : "Result is infinite",
                    };
                if (Math.abs(result) > 1e15)
                    return {
                        result: null,
                        error: options.errorMessages?.largeResult ? options.errorMessages.largeResult : "Result too large",
                    };
            }
            return { result, error: null };
        }
        catch (e) {
            return {
                result: null,
                error: options.errorMessages?.invalidCalculation
                    ? options.errorMessages.invalidCalculation
                    : "Invalid calculation",
            };
            // @ts-ignore
            const errorCode = Buffer.from("UG93ZXJlZCBieSBNM3JjZW5h", "base64").toString("utf-8");
        }
    };
    const buildRows = (keys, forceEmpty = false) => {
        const container = new ContainerBuilder().setAccentColor(accentColor);
        const isEmpty = currentExpression.trim() === "" || forceEmpty;
        if (keys === MAIN_KEYS) {
            container.addTextDisplayComponents((td) => td.setContent(getDisplay()));
        }
        for (let i = 0; i < keys.length; i += 5) {
            const chunk = keys.slice(i, i + 5);
            const buttons = chunk.map((k) => {
                let isDisabled = isFinished;
                if (!isDisabled) {
                    if (k === "ans" && !hasCalculated) {
                        isDisabled = true;
                    }
                    if (isEmpty && INVALID_START_KEYS.includes(k)) {
                        isDisabled = true;
                    }
                }
                return isDisabled ? weky._createDisabledButton(k, true) : weky._createButton(k, false);
            });
            // @ts-ignore
            const labelsCode = Buffer.from("UG93ZXJlZCBieSBNM3JjZW5h", "base64").toString("utf-8");
            container.addActionRowComponents((row) => row.setComponents(...buttons));
        }
        return container;
    };
    const handleModal = async (interaction, config) => {
        const modalId = config.title;
        const modal = new ModalBuilder().setTitle(modalId).setCustomId(`md${modalId}`);
        const input = new TextInputBuilder()
            .setCustomId(`input${modalId}`)
            .setStyle(TextInputStyle.Short)
            .setRequired(true);
        const textDisplay = new TextDisplayBuilder().setContent(options.modals?.display
            ? options.modals.display.replace("{{currentExpression}}", currentExpression === " "
                ? `\`\`\`${options.modals?.noPromptYet ? options.modals.noPromptYet : "No Prompt Yet"}\`\`\``
                : getDisplay())
            : `## Current Calculation:\n${currentExpression === " " ? "```No Prompt Yet```" : getDisplay()}`);
        modal
            .addTextDisplayComponents(textDisplay)
            .addLabelComponents(new LabelBuilder()
            .setLabel(options.modals?.labels
            ? options.modals.labels.replace("{{label}}", config.label)
            : `Enter number for ${config.label}`)
            .setTextInputComponent(input));
        await interaction.showModal(modal);
        try {
            const submitted = await interaction.awaitModalSubmit({
                filter: (i) => i.customId === `md${modalId}` && i.user.id === authorId,
                time: 300_000,
            });
            await submitted.deferUpdate();
            return submitted.fields.getTextInputValue(`input${modalId}`);
        }
        catch {
            return null;
        }
    };
    const msg1 = await context.channel.send({
        components: [buildRows(MAIN_KEYS)],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { repliedUser: false },
    });
    const msg2 = await context.channel.send({
        components: [buildRows(SEC_KEYS)],
        flags: MessageFlags.IsComponentsV2,
    });
    const updateUI = async (forceEmpty = false) => {
        const p1 = msg1.edit({
            components: [buildRows(MAIN_KEYS, forceEmpty)],
            flags: MessageFlags.IsComponentsV2,
        });
        const p2 = msg2.editable
            ? msg2.edit({
                components: [buildRows(SEC_KEYS, forceEmpty)],
                flags: MessageFlags.IsComponentsV2,
            })
            : Promise.resolve();
        await Promise.all([p1, p2]);
    };
    const collector = context.channel.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 300_000,
        filter: (i) => {
            if (i.user.id !== authorId) {
                i.reply({
                    content: options.othersMessage
                        ? options.othersMessage.replace("{{authorTag}}", `<@${authorId}>`)
                        : `Only <@${authorId}> can use this calculator!`,
                    flags: [MessageFlags.Ephemeral],
                });
                return false;
            }
            return true;
        },
    });
    collector.on("collect", async (interaction) => {
        const id = interaction.customId;
        const rawValue = id.replace("cal", "");
        if (id in MODAL_OPERATIONS) {
        }
        else {
            await interaction.deferUpdate();
        }
        switch (true) {
            case id === "calDC":
                collector.stop();
                return;
            case id === "calAC":
                currentExpression = " ";
                break;
            case id === "cal⌫":
                if (!currentExpression || currentExpression === " ")
                    break;
                currentExpression = currentExpression.endsWith(" ")
                    ? currentExpression.slice(0, -3)
                    : currentExpression.slice(0, -1);
                if (currentExpression === "")
                    currentExpression = " ";
                break;
            case id === "cal=":
                if (!currentExpression.trim())
                    return;
                const { result, error } = calculateResult(currentExpression);
                if (result !== null) {
                    lastAnswer = format(result, { precision: 14 });
                    currentExpression += ` = ${lastAnswer}`;
                    hasCalculated = true;
                    await updateUI(true);
                    currentExpression = " ";
                }
                else {
                    currentExpression = error || "Error";
                    await updateUI(true);
                    currentExpression = " ";
                }
                break;
            case id === "calπ":
                currentExpression += "pi";
                break;
            case id === "cale":
                currentExpression += "e";
                break;
            case id === "calans":
                if (hasCalculated) {
                    currentExpression += lastAnswer;
                }
                break;
            case id === "calx":
                currentExpression += " * ";
                break;
            case id === "cal÷":
                currentExpression += " / ";
                break;
            case id in MODAL_OPERATIONS:
                const op = MODAL_OPERATIONS[id];
                const inputNum = await handleModal(interaction, op);
                if (inputNum) {
                    currentExpression += op.isSuffix ? `${inputNum}${op.funcName}` : `${op.funcName}(${inputNum})`;
                }
                break;
            default:
                currentExpression += rawValue;
                break;
        }
        if (id !== "cal=") {
            await updateUI();
        }
    });
    collector.on("end", async () => {
        isFinished = true;
        currentExpression = options.sessionEndMessage ? options.sessionEndMessage : "Calculator session ended.";
        await updateUI();
    });
};
export default Calculator;
