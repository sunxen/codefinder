# Code Finder
代码推荐和搜索工具，在输入时自动提示最有可能输入的代码片段，也可以通过主动搜索来快速输入。

## 两种代码提示模式：
- 精准匹配，暂且称为老实人模式：常规的代码输入就会触发这种模式，CodeFinder只会在高度匹配的时候提示。
![](https://qzonestyle.gtimg.cn/aoi/sola/20200309212744_wWEO3FL2zN.png)
![](https://qzonestyle.gtimg.cn/aoi/sola/20200309212744_EP3RP0qpfy.png)

- 模糊匹配，暂且称为渣男模式：通过跳跃式输入目标代码片段的部分字母，或者在输入过程连续输入2个空格就会触发这种模式，CodeFinder每次会提示多个匹配的片段，该模式支持模糊匹配。
![](https://qzonestyle.gtimg.cn/aoi/sola/20200309212743_jjy7p2hUQU.png)
![](https://qzonestyle.gtimg.cn/aoi/sola/20200309212743_spbP2GMO5S.png)
（最后一种情况需要连续输入了2个空格触发）

对于确定有结果的代码片段（本地项目存在），或者只记得部分关键字，推荐用跳跃式输入，从而实现代码的快速输入。

## 已支持的编程语言
javascript / typescript

## 技术原理
- 内置常用代码片段，包括es6，mqq，微信小程序等等
- 自动从本地项目代码提取代码片段（打开项目文件时触发）
- 对相同代码片段/模式进行聚合，提高匹配权重
- 在输入时搜索所有代码片段进行提示


## 开源工作未准备好，有问题欢迎提issue
