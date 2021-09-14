/* tslint:disable-next-line */ 
import * as vscode from 'vscode';
import path = require('path');
import fs = require('fs');


/**
 * Provider for json grid editors.
 * 
 * Cat scratch editors are used for `.json` files, which are just json files.
 * To get started, run this extension and open an empty `.json` file in VS Code.
 * 
 * This provider demonstrates:
 * 
 * - Setting up the initial webview for a custom editor.
 * - Loading scripts and styles in a custom editor.
 * - Synchronizing changes between a text document and a custom editor.
 */
export class GridEditorProvider implements vscode.CustomTextEditorProvider {

	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		const provider = new GridEditorProvider(context);
		const providerRegistration = vscode.window.registerCustomEditorProvider(GridEditorProvider.viewType, provider);
		return providerRegistration;
	}

	private static readonly viewType = 'jsonTable.tableEditor';

	constructor(
		private readonly context: vscode.ExtensionContext
	) { }

	/**
	 * Called when our custom editor is opened.
	 * 
	 * 
	 */
	public async resolveCustomTextEditor(
		document: vscode.TextDocument,
		webviewPanel: vscode.WebviewPanel,
		_token: vscode.CancellationToken
	): Promise<void> {
		
		// Setup initial content for the webview
		webviewPanel.webview.options = {
			enableScripts: true,
		};

		const html = this.getHtml4Path(path.join(this.context.extensionPath, 'src', 'media', 'dist', 'index.html'), webviewPanel.webview);
		webviewPanel.webview.html = html;
		
		const updateWebview = () => {
			webviewPanel.webview.postMessage({
				type: 'update',
				text: this.getDocumentText(document),
				name: document.fileName,
				document
			});
		};

		updateWebview();
		// Hook up event handlers so that we can synchronize the webview with the text document.
		//
		// The text document acts as our model, so we have to sync change in the document to our
		// editor and sync changes in the editor back to the document.
		// 
		// Remember that a single text document can also be shared between multiple custom
		// editors (this happens for example when you split a custom editor)

		const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument((e: any) => {
			if (e.document.uri.toString() === document.uri.toString()) {
				updateWebview();
			}
		});

		// Make sure we get rid of the listener when our editor is closed.
		webviewPanel.onDidDispose(() => {
			changeDocumentSubscription.dispose();
		});

		// Receive message from the webview.
		webviewPanel.webview.onDidReceiveMessage(e => {
			switch (e.type) {
				case 'save':
					this.updateTextDocument(document, e.text);
					return;
			}
		});

		updateWebview();
	}

	
    /**
     *Get html from the file path and replace resources protocol to `vscode-resource`
     *
     * @param {string} htmlPath path of html path 
     * @returns
     * @memberof WebView
     */
	getHtml4Path(htmlPath: string, webview: any) {
        const scheme = 'vscode-resource';
        const dirPath = path.dirname(htmlPath);
        let html = fs.readFileSync(htmlPath, 'utf-8');
        html = html.replace(/(href=|src=)(.+?)( |>)/g, (_, $1, $2, $3) => {
            let uri = $2;
            uri = uri.replace('"', '').replace("'", '');
            (uri = `.${uri}`);
			const cp = path.resolve(dirPath, uri);
			const furi = vscode.Uri.file(cp);
			
			if (webview.asWebviewUri) {
				uri = `${$1}${webview.asWebviewUri(furi)}${$3}`;
			} else {
				uri = `${$1}${furi.with({ scheme }).toString()}${$3}`;
			}
			return uri.replace('%22', '');
        });
        return html;
    }

	/**
	 * Try to get a current document as json text.
	 */
	private getDocumentText(document: vscode.TextDocument): any {
		const text = document.getText();
		if (text.trim().length === 0) {
			return {};
		}

		return text;
	}

	/**
	 * Write out the json to a given document.
	 */
	private updateTextDocument(document: vscode.TextDocument, json: string) {
		const edit = new vscode.WorkspaceEdit();
		
		// Just replace the entire document every time for this example extension.
		// A more complete solution should compute minimal edits instead.
		edit.replace(
			document.uri,
			new vscode.Range(0, 0, document.lineCount, 0),
			json);

		return vscode.workspace.applyEdit(edit);
	}
}
