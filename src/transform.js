import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import chalk from 'chalk';
import id from 'shortid';
import cssTemplate from './cssTemplate';
import svgTemplate from './svgTemplate';
import toUnicode from './toUnicode';
import svg2ttf from 'svg2ttf';
import ttf2eot from 'ttf2eot';
import ttf2woff from 'ttf2woff';
import ttf2woff2 from 'ttf2woff2';
import htmlTemplate from "./htmlTemplate";

export default (svgPath, prefix) => new Promise((resolve, reject) => {

    // Input SVG file
    const svg = fs.readFileSync(svgPath, 'utf-8');
    const dom = new JSDOM(svg);
    const { document } = dom.window;

    const $fontFace = document.querySelector('font-face');
    const $glyphs = document.querySelectorAll('glyph');

    const fontFamily = $fontFace.getAttribute('font-family');

    let buffer = cssTemplate({
        fontFamily, // 폰트 이름
        prefix, // 접두사
    });

    const glyphs_length = $glyphs.length;
    let iconList = '';
    let counter = 59392;
    for (let i = 0; i < glyphs_length; i++) {
        const glyphName = $glyphs[i].getAttribute('glyph-name');
        const unicode = $glyphs[i].getAttribute('unicode');
        // if (unicode) {
        //     buffer += `.${prefix}-${glyphName}:before { content: '${toUnicode(unicode)}' } \n`;
        // } else {
        //     const hexCounter = counter.toString(16);
        //     buffer += `.${prefix}-${glyphName}:before { content: '\\${hexCounter.toUpperCase()}' } \n`;
        //     $glyphs[i].setAttribute('unicode', `{{amp}}#x${hexCounter};`);
        //     counter++;
        // }
        const hexCounter = counter.toString(16);
        buffer += `.${prefix}-${glyphName}:before { content: '\\${hexCounter.toUpperCase()}' } \n`;
        $glyphs[i].setAttribute('unicode', '');
        $glyphs[i].setAttribute('unicode', `{{amp}}#x${hexCounter};`);
        counter++;
        iconList += `<span class="${prefix}-${glyphName}"></span>`;
    }

    const hash = id.generate();
    const outputDirName = `${fontFamily}_${hash}`;
    const outputDirFullPath = path.resolve(`./output/${outputDirName}`);
    fs.mkdirSync(outputDirFullPath);

    const newSvgPath = path.join(outputDirFullPath, `${fontFamily}.svg`);
    const newSvgFile = svgTemplate(dom.window.document.body.innerHTML.replace(/{{amp}}/gi, '&'));
    fs.writeFileSync(newSvgPath, newSvgFile, 'utf-8');
    console.log(chalk.greenBright(`${fontFamily}.svg 파일이 이동되었습니다`));
    const newSvg = fs.readFileSync(newSvgPath, 'utf-8');

    fs.writeFile(path.join(outputDirFullPath, `${fontFamily}.html`), htmlTemplate(fontFamily, iconList), 'utf-8', err => {
        if (err) {
            return console.log(err);
        }
        console.log(
            chalk.greenBright(`${fontFamily}.html 파일을 생성하였습니다`)
        );
    });


    /**
     * SVG -> CSS
     */
    const transformSVGtoCSS = new Promise((resolve, reject) => {
        console.log('Start to generate css file...');
        fs.writeFile(path.join(outputDirFullPath, `${fontFamily}.css`), buffer, 'utf-8', err => {
            if (err) {
                return reject(err);
            }
            console.log(
                chalk.greenBright(`${fontFamily}.css 파일로 변환되었습니다`)
            );
            return resolve();
        });
    });

    /**
     * SVG -> TTF
     */
    const transformSVGtoTTF = () => new Promise((resolve, reject) => {
        console.log('Start to generate ttf file...');
        const ttf = svg2ttf(newSvg, {});
        fs.writeFile(path.join(outputDirFullPath, `${fontFamily}.ttf`), new Buffer(ttf.buffer), 'utf-8', err => {
            if (err) {
                return reject(err);
            }
            console.log(
                chalk.greenBright(`${fontFamily}.ttf 파일로 변환되었습니다`)
            );
            /**
             * 생성된 ttf 파일 읽기
             */
            const ttfOutput = new Uint8Array(new Buffer(ttf.buffer));
            return resolve(ttfOutput);
        });
    });

    /**
     * TTF -> EOT
     */
    const transformTTFtoEOT = (ttfOutput) => new Promise((resolve, reject) => {
        console.log('Start to generate eot file...');
        const eot = ttf2eot(ttfOutput);
        fs.writeFile(path.join(outputDirFullPath, `${fontFamily}.eot`), new Buffer(eot.buffer), 'utf-8', err => {
            if (err) {
                return reject(err);
            }
            console.log(
                chalk.greenBright(`${fontFamily}.eot 파일로 변환되었습니다`)
            );
            return resolve();
        });
    });

    /**
     * TTF -> WOFF
     */
    const transformTTFtoWOFF = (ttfOutput) => new Promise((resolve, reject) => {
        console.log('Start to generate woff file...');
        const woff = ttf2woff(ttfOutput);
        fs.writeFile(path.join(outputDirFullPath, `${fontFamily}.woff`), new Buffer(woff.buffer), 'utf-8', err => {
            if (err) {
                return reject(err);
            }
            console.log(
                chalk.greenBright(`${fontFamily}.woff 파일로 변환되었습니다`)
            );
            return resolve();
        });

    });

    /**
     * TTF -> WOFF2
     */
    const transformTTFtoWOFF2 = (ttfOutput) => new Promise((resolve, reject) => {
        console.log('Start to generate woff2 file...');
        const woff2 = ttf2woff2(ttfOutput);
        fs.writeFile(path.join(outputDirFullPath, `${fontFamily}.woff2`), woff2, 'utf-8', err => {
            if (err) {
                return reject(err);
            }
            console.log(
                chalk.greenBright(`${fontFamily}.woff2 파일로 변환되었습니다`)
            );
            return resolve();
        });
    });

    transformSVGtoCSS
        .then(transformSVGtoTTF)
        .then((ttfOutput) => {
            Promise.all([
                transformTTFtoEOT(ttfOutput),
                transformTTFtoWOFF(ttfOutput),
                transformTTFtoWOFF2(ttfOutput),
            ]).then(() => {
                console.log(
                    chalk.cyan(`${outputDirName} transform success.`)
                );
            }).catch((err) => {
                console.log(err);
            })
        })
        .catch((err) => {
            console.log(err);
        })
});