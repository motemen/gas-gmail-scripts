declare var global: any;

// I don't know where the specification is, just a guess from actual mails.
interface InboxMarkup {
  updates?: {
    snippets?: {
      icon: string;
      message: string;
    }[];
  };
}

global.main = function main() {
  const SCRIPT_ID = ScriptApp.getScriptId();
  const labelProcessed = GmailApp.createLabel(`gas-${SCRIPT_ID}-processed`);

  const githubThreads = GmailApp.search("in:inbox from:notifications@github.com");

  const githubMergedLabel = GmailApp.createLabel("GitHub/Merged");
  const githubClosedLabel = GmailApp.createLabel("GitHub/Closed");

  for (const thread of githubThreads) {
    for (const message of thread.getMessages()) {
      const rawContent = message.getRawContent();

      const markupMatch = /<script type="application\/json" data-scope="inboxmarkup">([^]+?)<\/script>/.exec(
        rawContent
      );
      if (!markupMatch) {
        continue;
      }

      let info: InboxMarkup;
      try {
        info = JSON.parse(markupMatch[1]);
      } catch (e) {
        continue;
      }

      const snippet = info.updates && info.updates.snippets && info.updates.snippets[0];
      if (!snippet) {
        continue;
      }

      const updateMessageMatch = /^(Merged|Closed|Reopened) #[0-9]+(?:\.| )/.exec(snippet.message);
      if (!updateMessageMatch) {
        continue;
      }

      if (updateMessageMatch[1] === "Merged") {
        githubMergedLabel.addToThread(thread);
        labelProcessed.addToThread(thread);
      } else if (updateMessageMatch[1] === "Closed") {
        githubClosedLabel.addToThread(thread);
        labelProcessed.addToThread(thread);
      } else if (updateMessageMatch[1] === "Reopened") {
        githubClosedLabel.removeFromThread(thread);
        labelProcessed.addToThread(thread);
      }
    }
  }
};
