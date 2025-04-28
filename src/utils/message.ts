import { proto, WAMessage } from "baileys";
import { logger } from "./logger";

export type FormattedMessage = {
  key: proto.IMessageKey;
  messageTimestamp: Number | Long | null | undefined;
  pushName: string | null;
  content: string | null;
};

/**
 * @param message
 * @returns a message vindo do Baileys para algo mais amigável.
 */
export const getMessage = (message: WAMessage): FormattedMessage | undefined => {
  try {
    return {
      key: message.key,
      messageTimestamp: message.messageTimestamp ?? null,
      pushName: message.pushName ?? null,
      content:
        message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        null,
    };
  } catch (error) {
    logger.error(error);
  }
};
