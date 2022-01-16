[English](./README.en.md)

# Code Finder
CodeFinder 是代码的智能输入法，输入少量字符来快速完成一行或者多行代码。自动提取当前项目的所有代码片段，也可以添加自定义代码片段。支持所有编程语言，比如 Javascript, HTML, CSS, Python, Go, PHP, Vue, React ...

## 如何使用
触发方式：跳跃式输入（字符串 + 空格 + 字符串 ...），或者双空格（字符串 + 空格 + 空格 ...）

试下在 css 文件里面输入 `ba url` ，就可以快速完成以下代码
```
    background-image: url();
```

也可以输入 `back image` 或者 `ba im u` 等等，不需要像 Snippets 那样去记忆对应的缩写。

一个实际项目的例子

![](https://qzonestyle.gtimg.cn/qzone/qzact/act/external/club-dist/sx/p2.gif)

*为了减少干扰，有时跳跃式输入不会触发，这时可以使用双空格*

## 自定义代码片段
这里有一些常用代码片段 [share-snippets](https://github.com/sunxen/codefinder/tree/master/packages/share-snippets)，保存到当前项目的 `.codefinder` 目录里，就可以使用了。（该css文件已内置，不用再添加）

<image src="https://raw.githubusercontent.com/sunxen/images/main/tree.png" width="200">

新增代码片段
* 文件名对应编程语言后缀名
* 多个代码片段用双空行分隔
