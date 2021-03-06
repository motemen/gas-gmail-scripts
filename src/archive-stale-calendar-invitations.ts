declare var global: any;

global.main = function main() {
  const SCRIPT_ID = ScriptApp.getScriptId();
  const labelProcessed = GmailApp.createLabel(`gas-${SCRIPT_ID}-processed`);

  const now = new Date();

  const invitationThreads = GmailApp.search("invite.ics in:inbox");

  for (const thread of invitationThreads) {
    const message = thread.getMessages().pop()!;
    const attachments = message.getAttachments();
    for (const attachment of attachments) {
      if (attachment.getName() !== "invite.ics") {
        continue;
      }

      const icsContent = attachment.getDataAsString();
      const m = /^DTEND:([0-9]{4})([0-9]{2})([0-9]{2})T([0-9]{2})([0-9]{2})([0-9]{2})Z$/m.exec(icsContent);
      if (!m) {
        continue;
      }

      const eventEnd = new Date(
        Date.UTC(
          parseInt(m[1], 10),
          parseInt(m[2], 10) - 1,
          parseInt(m[3], 10),
          parseInt(m[4], 10),
          parseInt(m[5], 10),
          parseInt(m[6], 10)
        )
      );

      if (eventEnd < now) {
        thread.moveToArchive();
        thread.addLabel(labelProcessed);
      }
    }
  }
};
