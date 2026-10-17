import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, Interaction, LabelBuilder, MediaGalleryBuilder, Message, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { RenderPokemon } from "../canvas/RenderPokemon.js";
import { BaseGame } from "../core/BaseGame.js";
import { GuessThePokemonTypes } from "../core/Types.js";
import { fetchRandomPokemon, PokemonData } from "../data/pokemons.js";
import { formatTime, getRandomString, safeResolveColor } from "../utils/Helpers.js";

export class GuessThePokemon extends BaseGame<GuessThePokemonTypes> {
  private pokemon: PokemonData | null = null;
  private btnPrefix: string;
  private modalId: string;
  private startTime: number = 0;
  private gameTitle: string;
  private defaultColor: number;
  private giveUpButtonLabel: string;

  constructor(manager: any, options: GuessThePokemonTypes) {
    super(manager, options, "gtp");
    this.btnPrefix = getRandomString(6, "gtp_");
    this.modalId = `${this.btnPrefix}modal`;
    this.gameTitle = options.embed?.title || "Who's That Pokémon?";
    this.defaultColor = safeResolveColor(options.embed?.color, 0x5865f2);
    this.giveUpButtonLabel = options.giveUpButton || "Give Up";
    this.defaultTimeout = options.time || 60_000;
  }

  public async start(): Promise<void> {
    this.isActive = true;
    this.manager._eventManager.register(this);

    const loadingContainer = this.createGameContainer("loading");
    await this.ctx.sendInitial({
      components: [loadingContainer],
      flags: MessageFlags.IsComponentsV2,
    });

    try {
      this.pokemon = await fetchRandomPokemon();
    } catch {
      return this.endGame("error", "Failed to retrieve Pokémon data.");
    }

    this.startTime = Date.now();

    const buffer = await RenderPokemon.renderCard(this.pokemon, false);
    const attachment = new AttachmentBuilder(buffer, { name: "pokemon-card.png" });

    const activeContainer = this.createGameContainer("active", { image: "pokemon-card.png" });
    await this.ctx.edit({
      components: [activeContainer],
      files: [attachment],
      flags: MessageFlags.IsComponentsV2,
    });

    this.resetTimeout(() => this.endGame("lost"));
  }

  public async onInteraction(interaction: Interaction): Promise<void> {
    if (interaction.isButton()) {
      if (interaction.message.id !== this.ctx.gameMessage?.id) return;
      if (!this.isAuthorized(interaction)) return;

      const customId = interaction.customId;
      if (!customId.startsWith(this.btnPrefix)) return;

      const action = customId.replace(this.btnPrefix, "");

      if (action === "giveup") {
        await interaction.deferUpdate().catch(() => {});
        await this.endGame("lost");
        return;
      }

      if (action === "guess") {
        const modal = new ModalBuilder().setCustomId(this.modalId).setTitle("Guess The Pokémon");

        const textInput = new TextInputBuilder().setCustomId("pokemon_name").setStyle(TextInputStyle.Short).setMinLength(2).setMaxLength(30).setRequired(true).setPlaceholder("e.g. Pikachu");

        const label = new LabelBuilder().setLabel("What is the name of this Pokémon?").setTextInputComponent(textInput);

        modal.addLabelComponents(label);
        await interaction.showModal(modal).catch(() => {});
        return;
      }
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId !== this.modalId) return;
      if (interaction.user.id !== this.ctx.userId) return;

      await interaction.deferUpdate().catch(() => {});
      const input = interaction.fields.getTextInputValue("pokemon_name").trim();
      await this.processGuess(input);
    }
  }

  public async onMessage(message: Message): Promise<void> {
    if (message.channelId !== this.ctx.channel.id) return;
    if (message.author.id !== this.ctx.userId) return;

    const content = message.content.trim();
    if (!content || content.startsWith("/") || content.startsWith("!")) return;

    if (message.deletable) await message.delete().catch(() => {});
    await this.processGuess(content);
  }

  private async processGuess(guess: string): Promise<void> {
    if (!this.pokemon || !this.isActive) return;
    this.resetTimeout(() => this.endGame("lost"));

    const normalizedGuess = guess.toLowerCase().replace(/[^a-z0-9]/g, "");
    const correctName = this.pokemon.name.toLowerCase().replace(/[^a-z0-9]/g, "");

    if (normalizedGuess === correctName) {
      await this.endGame("won");
    } else {
      const buffer = await RenderPokemon.renderCard(this.pokemon, false);
      const attachment = new AttachmentBuilder(buffer, { name: "pokemon-card.png" });

      const incorrectNotice = this.options.incorrectMessage ? this.options.incorrectMessage.replace("{{answer}}", guess) : `❌ No, it's not **${guess}**! Try again.`;

      const container = this.createGameContainer("active", {
        image: "pokemon-card.png",
        statusNotice: incorrectNotice,
      });

      await this.ctx.edit({
        components: [container],
        files: [attachment],
        flags: MessageFlags.IsComponentsV2,
      });
    }
  }

  private async endGame(state: "won" | "lost" | "error", errorMsg?: string): Promise<void> {
    this.isActive = false;
    this.clearTimer();
    this.destroy();

    if (!this.pokemon) {
      const container = this.createGameContainer("error", { error: errorMsg || "Unknown error occurred." });
      await this.ctx.edit({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    const durationSec = formatTime(Date.now() - this.startTime);
    const buffer = await RenderPokemon.renderCard(this.pokemon, true);
    const attachment = new AttachmentBuilder(buffer, { name: "pokemon-revealed.png" });

    const container = this.createGameContainer(state, {
      image: "pokemon-revealed.png",
      timeTaken: durationSec,
      error: errorMsg,
    });

    await this.ctx.edit({
      components: [container],
      files: [attachment],
      flags: MessageFlags.IsComponentsV2,
    });
  }

  private createGameContainer(state: "loading" | "active" | "won" | "lost" | "error", details?: { image?: string; error?: string; statusNotice?: string; timeTaken?: string }): ContainerBuilder {
    const container = new ContainerBuilder();
    let content = "";
    const name = this.pokemon?.name || "Unknown";

    switch (state) {
      case "loading":
        container.setAccentColor(this.defaultColor);
        content = this.options.states?.loading ? this.options.states.loading.replace("{{gameTitle}}", this.gameTitle) : `## ${this.gameTitle}\n> 🔄 ${this.options.thinkMessage || "Searching the tall grass for a wild Pokémon..."}`;
        break;

      case "active":
        container.setAccentColor(this.defaultColor);
        const typesStr = this.pokemon?.types.map((t) => `\`${t}\``).join(", ") || "`Unknown`";
        const abilitiesStr = this.pokemon?.abilities.map((a) => `\`${a}\``).join(", ") || "`Unknown`";

        content = this.options.states?.active ? this.options.states.active.replace("{{gameTitle}}", this.gameTitle) : `## ${this.gameTitle}\n> **Types:** ${typesStr}\n> **Abilities:** ${abilitiesStr}\n\n> ⏳ Type your guess in chat or click **Guess Pokémon**!${details?.statusNotice ? `\n\n> ${details.statusNotice}` : ""}`;
        break;

      case "won":
        container.setAccentColor(0x57f287);
        const winText = this.options.winMessage ? this.options.winMessage.replace("{{answer}}", name).replace("{{time}}", details?.timeTaken || "0s") : `GG! It was **${name}**. You got it in **${details?.timeTaken || "0s"}**!`;
        content = this.options.states?.won ? this.options.states.won.replace("{{gameTitle}}", this.gameTitle).replace("{{answer}}", name) : `## 🎉 Pokémon Identified!\n> 🏆 ${winText}`;
        break;

      case "lost":
        container.setAccentColor(0xed4245);
        const loseText = this.options.loseMessage ? this.options.loseMessage.replace("{{answer}}", name) : `Better luck next time! It was **${name}**.`;
        content = this.options.states?.lost ? this.options.states.lost.replace("{{gameTitle}}", this.gameTitle).replace("{{answer}}", name) : `## 💨 Pokémon Got Away!\n> ${loseText}`;
        break;

      case "error":
        container.setAccentColor(0xff0000);
        content = this.options.states?.error ? this.options.states.error.replace("{{error}}", details?.error || "Unknown error.") : `## ❌ Error\n> ${details?.error || "Unknown error occurred."}`;
        break;
    }

    container.addTextDisplayComponents((t) => t.setContent(content));

    if (details?.image) {
      const gallery = new MediaGalleryBuilder().addItems((item) => item.setURL(`attachment://${details.image}`));
      container.addMediaGalleryComponents(gallery);
    }

    if (state === "active") {
      const guessBtn = new ButtonBuilder().setCustomId(`${this.btnPrefix}guess`).setLabel("Guess Pokémon").setEmoji("⚡").setStyle(ButtonStyle.Primary);

      const giveUpBtn = new ButtonBuilder().setCustomId(`${this.btnPrefix}giveup`).setLabel(this.giveUpButtonLabel).setEmoji("🏳️").setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(guessBtn, giveUpBtn);
      container.addActionRowComponents(row);
    }

    return container;
  }
}
