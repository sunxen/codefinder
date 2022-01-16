import * as vscode from 'vscode'
import finder from 'lin'
import provideCompletionItems from './provideCompletionItems'
import * as reporter from './reporter'

export const COMPLETION_TRIGGERS = [' ', '.', '(', '{', '[']

vscode.languages.registerCompletionItemProvider(
    { pattern: '**' },
    {
        provideCompletionItems,
    },
    ...COMPLETION_TRIGGERS
)

vscode.window.onDidChangeActiveTextEditor(editor => {
    if (editor?.document.fileName) {
        finder.analyze(editor.document.fileName)
    }
})
vscode.workspace.onDidSaveTextDocument(res => {
    finder.analyze(res.fileName)
})

export function activate(context: vscode.ExtensionContext): void {
    reporter.activate(context)
    vscode.commands.registerCommand('extension.selectItem', params => {
        reporter.reportSelect(params)
    })
    if (vscode.window.activeTextEditor?.document.fileName) {
        finder.analyze(vscode.window.activeTextEditor?.document.fileName)
    }
}

export function deactivate(): void {
    reporter.deactivate()
}
