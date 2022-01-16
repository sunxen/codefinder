# Code Finder
Smart input method for code and snippets, input few letters to complete one line or more code. Automatically extract all snippets from the current project, and you can also add custom snippets. Supports all programming languages: Javascript, HTML, CSS, Python, Go, PHP, Vue, React ...

## How to use
trigger: Jumping input (letters + space + letters ...), or Double spaces (letters + space + space ...))

typing `ba url` in css file, you can quickly complete the following code
```
    background-image: url();
```

typing `ba url` or `ba im u` also work. Not need to remember abbreviation like Snippets do.

a simple project example

![](https://qzonestyle.gtimg.cn/qzone/qzact/act/external/club-dist/sx/p2.gif)

*In order to reduce interference, sometimes Jumping input will not trigger, in this case you can use Double spaces*

## Custom snippets
Here are some commonly used snippets [share-snippets](https://github.com/sunxen/codefinder/tree/master/packages/share-snippets), save to current project's `.codefinder` directory, then you can use it. (This css file is included in the package, no need to add it)

<image src="https://raw.githubusercontent.com/sunxen/images/main/tree.png" width="200">

Add new snippets
* file name corresponds to programming language suffix
* multiple snippets use double blank lines to separate