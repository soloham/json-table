import * as vscode from 'vscode';
import { GridEditorProvider } from './gridEditor';

export function activate(context: vscode.ExtensionContext) {
	// Register our custom editor providers
	context.subscriptions.push(GridEditorProvider.register(context));
}
