import { WASocket } from "baileys";
import { FormattedMessage } from "../utils/message";

const MessageHandler = async (bot: WASocket, message: FormattedMessage) => {
    const numeroEspecifico = "559292169101@s.whatsapp.net"; // Substitui com o número correto

    if (
        message.content?.toLowerCase().includes("como está") &&
        message.key.remoteJid === numeroEspecifico
    ) {
        await bot.sendMessage(message.key.remoteJid!, { text: "estou bem" });
    }

    // Resposta padrão
    if (message.content === "Oi!") {
        await bot.sendMessage(message.key.remoteJid!, {
            text: "sua fatura está pronta!",
        });
    }
};

export default MessageHandler;
