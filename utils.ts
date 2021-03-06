import { terminal as term } from 'terminal-kit';
import { execSync } from 'child_process';
import fs from 'fs';

function sanitizeUrls(urls: string[]) {
    const rex = new RegExp(/(?:https:\/\/)?.*\/video\/[a-z0-9]{8}-(?:[a-z0-9]{4}\-){3}[a-z0-9]{12}$/, 'i');
    const sanitized: string[] = [];

    for (let i=0, l=urls.length; i<l; ++i) {
        const urlAr = urls[i].split('?');
        const query = urlAr.length === 2 && urlAr[1] !== '' ? '?'+urlAr[1] : '';
        let url = urlAr[0];

        if (!rex.test(url)) {
            if (url !== '')
                term.yellow("Invalid URL at line "+(i+1)+", skip..\n");

            continue;
        }

        if (url.substring(0, 8) !== 'https://')
            url = 'https://'+url;

        sanitized.push(url+query);
    }

    return sanitized;
}

export function getVideoUrls(videoUrls: any) {
    const t = videoUrls[0] as string;
    const isPath = t.substring(t.length-4) === '.txt';
    let urls: string[];

    if (isPath)
        urls = fs.readFileSync(t).toString('utf-8').split(/[\r\n]/);
    else
        urls = videoUrls as string[];

    return sanitizeUrls(urls);
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function checkRequirements() {
    try {
        const ytdlVer = execSync('youtube-dl --version');
        term.green(`Using youtube-dl version ${ytdlVer}`);

    } catch (e) {
        console.error('youtube-dl is missing. You need a fairly recent release of youtube-dl in $PATH.');
        process.exit(22);
    }

    try {
        const ffmpegVer = execSync('ffmpeg -version').toString().split('\n')[0];
        term.green(`Using ${ffmpegVer}\n`);

    } catch (e) {
        console.error('FFmpeg is missing. You need a fairly recent release of FFmpeg in $PATH.');
        process.exit(23);
    }
}