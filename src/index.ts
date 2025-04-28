import express from "express";
import makeWASocket, { Browsers, useMultiFileAuthState, DisconnectReason, WAMessage } from "baileys";
import qrcode from "qrcode-terminal";
import { Boom } from "@hapi/boom";
import { logger } from "./utils/logger";
import { FormattedMessage, getMessage } from "./utils/message";
import MessageHandler from "./handlers/message";

let sock: any;

export const initWASocket = async (): Promise<void> => {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  sock = makeWASocket({
    auth: state,
    browser: Browsers.appropriate("Desktop"),
    printQRInTerminal: false,
  });

  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }: any) => {
    logger.info(`Socket Connection Update: ${connection || ""} ${lastDisconnect || ""}`);

    if (connection === "close") {
      const shouldReconnect = (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        initWASocket();
      }
    }

    if (connection === "open") {
      logger.info("Bot Conectado");
    }

    if (qr !== undefined) {
      qrcode.generate(qr, { small: true });
    }
  });

  sock.ev.on("messages.upsert", ({ messages }: { messages: WAMessage[] }) => {
    for (let message of messages) {
      const isGroup = message.key.remoteJid?.endsWith("@g.us");
      const isStatus = message.key.remoteJid === "status@broadcast";

      if (!isGroup && !isStatus) {
        const formattedMessage = getMessage(message);
        if (formattedMessage) {
          MessageHandler(sock, formattedMessage);
        }
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);
};

// inicia o bot
initWASocket();

// cria servidor express
const app = express();
app.use(express.json());

// Defina os handlers de rota separadamente
const sendTextHandler = async (req: any, res: any) => {
  const { number, text } = req.body;
  const { nome } = req.params;

  if (!number || !text) {
    return res.status(400).send("Número ou mensagem faltando");
  }

  try {
    await sock.sendMessage(`${number}@s.whatsapp.net`, { text });
    return res.status(200).send(`Mensagem enviada para ${nome} com sucesso`);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Erro ao enviar mensagem");
  }
};

// Use o handler definido
app.post("/message/sendText/:nome", sendTextHandler);

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Servidor HTTP escutando na porta ${PORT}`);
});