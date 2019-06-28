/**
 * @file Ubuntu WSL Extension
 * @author Docter60
 * @version 0.1
 */

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as os from 'os';


// Default ubuntu path from user directory split into an array
const defUbuntuPath = ["AppData", "Local", "Microsoft", "WindowsApps"];

// Default ubuntu executable filename
const defUbuntuFilename = "ubuntu.exe";


/**
 * This method concatenates the desired folder to the parent path if it exists.
 * Returns empty string otherwise.
 * @param {String} path - The parent folder path to search in
 * @param {String} folder - The child folder to find
 */
function findFolder(path: string, folder: string) {
	if(fs.readdirSync(path).includes(folder)) {
		return path + "\\" + folder;
	}
	return "";
}


/**
 * This method attempts to locate the ubuntu WSL installed in the windows apps directory.
 * Returns undefined if the method fails to locate ubuntu.
 */
function findUbuntu() {
	var dir = os.homedir();
	for(var i = 0; i < defUbuntuPath.length; ++i) {
		dir = findFolder(dir, defUbuntuPath[i]);
		if(dir === "") {
			return undefined;
		}
	}

	var wDir = fs.readdirSync(dir);
	for(var j in wDir) {
		if(wDir[j] === defUbuntuFilename) {
			return dir + "\\" + defUbuntuFilename;
		}
	}
	return undefined;
}


/**
 * This method is called when the extension is activated.
 * Your extension is activated the very first time the command is executed.
 * @param context - the current vscode extension context
 */
export function activate(context: vscode.ExtensionContext) {
	
	/* 
	 * Use the console to output diagnostic information (console.log) and errors (console.error)
	 * This line of code will only be executed once when your extension is activated
	 */
	
	/**
	 * The command has been defined in the package.json file.
	 * Now provide the implementation of the command with registerCommand.
	 * The commandId parameter must match the command field in package.json
	 */
	let disposable = vscode.commands.registerCommand('extension.newUbuntuTerminal', () => {
		// The code you place here will be executed every time your command is executed

		// Find ubuntu install
		var ubuntuPath = findUbuntu();

		// If ubuntu was not found, show an error and stop
		if(ubuntuPath === undefined) {
			vscode.window.showErrorMessage("Could not find Windows Subsystem for Linux: Ubuntu Edition. Is WSL: Ubuntu Edition installed?");
			return;
		}

		// Creates a new terminal with ubuntu
		var terminal = vscode.window.createTerminal("Ubuntu", ubuntuPath);

		// Initialize terminal in current working directory if a folder is open
		var curDir = vscode.workspace.rootPath;
		if(curDir !== undefined) {
			curDir = curDir.replace(/\\/g, "/"); // Replace "\" with "/"
			var colonPos = curDir.search(":"); // Find and remove colon for mounting path
			curDir = curDir.slice(0, colonPos) + curDir.slice(colonPos + 1);
			terminal.sendText("cd ".concat("/mnt/" + curDir), true); // Set terminal in working directory
		} else {
			vscode.window.showInformationMessage("No active workspace is currently opened. Going to default WSL path.");
		}

		// Clear and show terminal
		terminal.sendText("clear", true);
		terminal.show(true);
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
