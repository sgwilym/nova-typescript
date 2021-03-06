// eslint-disable-next-line no-unused-vars
import type * as lspTypes from "vscode-languageserver-protocol";
import { wrapCommand } from "../novaUtils";
import { rangeToLspRange } from "../lspNovaConversions";

// @Panic: this is totally decoupled from typescript, so it could totally be native to Nova

// This isn't supported by typescript-language-server. Hopefully we can get it at some point

export function registerFindReferences(client: LanguageClient) {
  return nova.commands.register(
    "apexskier.typescript.findReferences",
    wrapCommand(findReferences)
  );

  async function findReferences(editor: TextEditor) {
    console.log("apexskier.typescript.findReferences");

    const selectedRange = editor.selectedRange;
    const selectedPosition = rangeToLspRange(editor.document, selectedRange)
      ?.start;
    if (!selectedPosition) {
      nova.workspace.showWarningMessage(
        "Couldn't figure out what you've selected."
      );
      return;
    }
    const params: lspTypes.ReferenceParams = {
      textDocument: { uri: editor.document.uri },
      position: selectedPosition,
      context: {
        includeDeclaration: false, // TODO
      },
    };
    const response = (await client.sendRequest(
      "textDocument/findReferences",
      params
    )) as lspTypes.Location[] | null;

    // never resolves, unimplemented

    if (response == null) {
      nova.workspace.showWarningMessage("Couldn't find references.");
      return;
    }

    console.log(JSON.stringify(response));
  }
}
