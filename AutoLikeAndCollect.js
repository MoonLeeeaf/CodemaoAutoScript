/*
 * ©2024 满月叶
 * GitHub: MoonLeeeaf
 * 参考接口来源 https://shequ.codemao.cn/community/429585
 */

const https = require("https")
const fs = require("fs")
const process = require("process")

let collect = false

const headers = {
    "Content-Type": "application/json",
    "User-Agent": 'Mozilla/5.0 (Windows NT 5.1rv: 21.0) Gecko/20100101 Firefox/21.0',
    'cookie': fs.readFileSync("cookie.txt"), // document.cookie 这个得你自己获取哦
}

const sleep = async (t) => new Promise((res) => setTimeout(res, t))

function likeAndCollect(id) {
    console.log("当前作品 " + id)
    let a = https.request({
        hostname: 'api.codemao.cn',
        port: 443,
        path: '/nemo/v2/works/' + id + '/like',
        method: 'POST',
        headers: headers,
    }, (re) => {
        re.on('error', () => null)
        console.log("作品 " + id + " 自动点赞" + (re.statusCode == 200 ? "成功" : "失败 错误码 " + re.statusCode))
    })
    a.write("{}")
    a.end()
    if (collect) {
        a = https.request({
            hostname: 'api.codemao.cn',
            port: 443,
            path: '/nemo/v2/works/' + id + '/collection',
            method: 'POST',
            headers: headers,
        }, (re) => {
            re.on('error', () => null)
            console.log("作品 " + id + " 自动收藏" + (re.statusCode == 200 ? "成功" : "失败 错误码 " + re.statusCode))
        })
        a.write("{}")
        a.end()
    }
}

async function findRecommend(id) {
    return new Promise((res) => {
        https.get("https://api.codemao.cn/nemo/v2/works/web/" + id + "/recommended", (re) => {
            let data = ""

            re.on('data', (chunk) => {
                data += chunk;
            })

            re.on('error', () => null)

            re.on('end', async () => {
                let l = JSON.parse(data)
                for (let i of l) {
                    likeAndCollect(i.id)
                    await sleep(Math.random() * 2000)
                }
            })
        })
    })
}

async function main() {
    // 寻找最新发布的作品
    https.get("https://api.codemao.cn/creation-tools/v1/pc/discover/newest-work?offset=1&limit=15", (re) => {
        let data = ""

        re.on('data', (chunk) => {
            data += chunk;
        })

        re.on('error', () => null)

        re.on('end', async () => {
            let d = JSON.parse(data)
            for (let i of d.items) {
                likeAndCollect(i.work_id)
                // 寻找推荐的作品
                findRecommend(i.work_id)
                await sleep(Math.random() * 2000)
            }
        })
    }).end()
    await sleep(Math.random() * 6000)
    main()
}

process.stdin.setEncoding('utf8');

process.stdout.write('需要启用收藏吗(y/n)? ')
process.stdin.once('readable', () => {
    const chunk = process.stdin.read();
    if (chunk !== null) {
        if ("y" == chunk.trim().toLowerCase())
            collect = true
        main()
        process.stdin.end()
    }
})

// 永不停息

process.on('uncaughtException', (err) => {
    console.error(err)
})

process.on('unhandledRejection', (reason, promise) => {
    console.error(reason)
})
