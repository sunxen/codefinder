import * as vscode from 'vscode'
import finder from 'lin'
import * as path from 'path'
import * as reporter from './reporter'

export default function provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    const lineText = document.lineAt(position.line).text
    const firstCharIndex = lineText.search(/\S/)
    const query = lineText.substring(firstCharIndex)

    const res = finder.search(query, document.fileName)
    if (res.results?.length > 0) {
        reporter.reportSearch(
            query,
            path.extname(document.fileName),
            res.searchMode
        )
    }

    const list = res.results.map((result, index) => {
        const { snippet, snippetWithPlaceholder } = result
        const item = new vscode.CompletionItem(
            `⭐ ${snippet.replace(/\n/g, ' ')}`
        )
        item.detail = 'CodeFinder'
        item.documentation = snippet
        item.insertText = snippetWithPlaceholder
            ? new vscode.SnippetString(snippetWithPlaceholder)
            : snippet
        item.sortText = String.fromCharCode(0) + String.fromCharCode(index)
        item.filterText = lineText
        item.range = new vscode.Range(
            position.line,
            firstCharIndex,
            position.line,
            lineText.length
        )
        item.command = getSelectCommand(result)
        return item
    })
    return new vscode.CompletionList(list, true)
}

function getSelectCommand(result: reporter.SearchResultItem) {
    return {
        arguments: [result],
        command: 'extension.selectItem',
        title: 'codefinder select item',
    }
}
