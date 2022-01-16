import * as fs from 'fs'
import * as path from 'path'
import * as globby from 'globby'
import getPathMatchValue from './getPathMatchValue'

/**
 * get all files with same suffix from target file in the project
 * find project dir by `.gitignore`
 * sort by time and path similarity, return top max files
 */
export function getProjectExtFiles(targetFile: string, max: number): string[] {
    const projectDir = getProjectDir(targetFile)
    // windows path
    projectDir.replace('\\', '/')
    const ext = getFileExt(targetFile)
    const list = globby.sync(projectDir, {
        cwd: projectDir,
        gitignore: true,
        expandDirectories: {
			extensions: [ext]
		}
    })

    if (list.length <= max) {
        return list
    }

    // half from time and half from path similarity
    const timeSortedList = sortFilesByTime(list)
    const pathSortedList = sortFilesByPath(list, targetFile)
    const set = new Set<string>()
    while (timeSortedList.length > 0 || pathSortedList.length > 0) {
        if (timeSortedList.length > 0) {
            set.add(timeSortedList.shift())
        }
        if (set.size >= max) {
            break
        }

        if (pathSortedList.length > 0) {
            set.add(pathSortedList.shift())
        }
        if (set.size >= max) {
            break
        }
    }
    return Array.from(set)
}

type FileInfo = {
    file: string
    time?: number
    value?: number
}

function sortFilesByTime(list: string[]) {
    const infoList: FileInfo[] = []
    list.forEach(file => {
        const stat = fs.statSync(file)
        infoList.push({
            file,
            time: stat.mtimeMs
        })
    })
    infoList.sort((item1, item2) => item2.time - item1.time)
    return infoList.map(item => item.file)
}

function sortFilesByPath(list: string[], targetFile: string) {
    const infoList: FileInfo[] = []
    list.forEach(file => {
        infoList.push({
            file,
            value: getPathMatchValue(file, targetFile)
        })
    })
    infoList.sort((item1, item2) => item2.value - item1.value)
    return infoList.map(item => item.file)
}

export function getProjectDir(targetFile: string): string{
    const dirList: string[] = []
    let dir = path.dirname(targetFile)
    while(!dirList.includes(dir)){
        dirList.push(dir)
        dir = path.dirname(dir)
    }
    for (const item of dirList){
        if(fs.existsSync(path.join(item, '.git'))){
            return item
        }
    }
    return dirList[0]
}

export function getFileExt(file: string): string {
    return path.extname(file).substring(1)
}

export function getProjectExtKey(targetFile: string): string {
    return `${getProjectDir(targetFile)}:${getFileExt(targetFile)}`
}
