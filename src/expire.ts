declare var global: any;

global.main = function main() {
  const SCRIPT_ID = ScriptApp.getScriptId();
  const labelProcessed = GmailApp.createLabel(`gas-${SCRIPT_ID}-processed`);

  const labels = GmailApp.getUserLabels();
  for (const label of labels) {
    const name = label.getName();
    const m = /^\+expires-(.+)$/.exec(name);
    if (!m) {
      continue;
    }

    const threadsToArchive = GmailApp.search(`label:${name} older_than:${m[1]} in:inbox`);
    for (const thread of threadsToArchive) {
      thread.moveToArchive();
      thread.removeLabel(label);
      thread.addLabel(labelProcessed);
    }
  }
};
