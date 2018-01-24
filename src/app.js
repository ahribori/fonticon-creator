import chalk from 'chalk';
import clear from 'cli-clear';
import figlet from 'figlet';
import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs';
import transform from './transform';

clear();
console.log(
    chalk.yellow(figlet.textSync('SVG to FONTICON'))
);

const ROOT = path.resolve('.');
const inputPath = path.join(ROOT, 'input');
const basePath = path.join(ROOT, '__base__');
fs.existsSync(inputPath) || fs.mkdirSync(inputPath);
fs.existsSync(basePath) || fs.mkdirSync(basePath);
const files = fs.readdirSync(inputPath);
const basedFiles = fs.readdirSync(basePath);
const svgFiles = [];
const pathsOfBasedSvgFile = [];

files.map(file => {
    if (new RegExp(/\.svg$/).test(file)) {
        svgFiles.push(file);
    }
});
basedFiles.forEach((file) => {
    if (new RegExp(/\.svg$/).test(file)) {
        pathsOfBasedSvgFile.push(path.join(basePath, file));
    }
});

if (svgFiles.length === 0) {
    console.log(chalk.bgWhite.red('ERROR: input 폴더에 svg 파일을 넣어주세요'));
}

const questions = [
    {
        type: 'list',
        name: 'svg_file',
        message: 'CSS 파일로 변환할 SVG 폰트 파일을 선택하세요:)',
        choices: svgFiles
    },
    {
        type: 'input',
        name: 'prefix',
        message: '폰트 클래스에 붙을 접두사를 지정하세요. 기본값은 icon 입니다:) ',
        default: 'icon',
    }
];

inquirer.prompt(questions).then((answer) => {
    const { svg_file, prefix } = answer;
    transform(path.resolve('input', svg_file), pathsOfBasedSvgFile, prefix);
});