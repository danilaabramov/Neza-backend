import puppeteer from 'puppeteer'

export const LAUNCH_PUPPETEER_OPTS = {
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1980x1080'
    ]
}

export const PAGE_PUPPETEER_OPTS = {
    networkIde2Timeout: 5000,
    waitUntil: 'networkidle2',
    timeout: 3000000
}

export async function getPageContent(url) {
    try {
        const browser = await puppeteer.launch(LAUNCH_PUPPETEER_OPTS)
        const page = await browser.newPage()
        await page.goto(url, PAGE_PUPPETEER_OPTS)
        const content = await page.content()
        await browser.close()
        return content
    } catch (err) {
        throw err
    }
}
