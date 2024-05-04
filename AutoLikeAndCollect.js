/*
 * ©2024 满月叶
 * GitHub: MoonLeeeaf
 * 参考接口来源 https://shequ.codemao.cn/community/429585
 */

const https = require("https")
const fs = require("fs")

const headers = {
    "Content-Type": "application/json",
    "User-Agent": 'Mozilla/5.0 (Windows NT 5.1rv: 21.0) Gecko/20100101 Firefox/21.0',
    'cookie': fs.readFileSync("cookie.txt"), // document.cookie 这个得你自己获取哦
}

const sleep = async (t) => new Promise((res) => setTimeout(res, t))

async function main() {
    https.get("https://api.codemao.cn/creation-tools/v1/pc/discover/newest-work?offset=1&limit=5", (re) => {
        let data = ""

        re.on('data', (chunk) => {
            data += chunk;
        })

        re.on('end', async () => {
            let d = JSON.parse(data)
            for (let i of d.items) {
                console.log("当前作品 " + i.work_id)
                let id = i.work_id
                let a = https.request({
                    hostname: 'api.codemao.cn',
                    port: 443,
                    path: '/nemo/v2/works/' + id + '/like',
                    method: 'POST',
                    headers: headers,
                }, (re) => {
                    console.log("作品 " + id + " 自动点赞" + (re.statusCode == 200 ? "成功" : "失败 错误码 " + re.statusCode))
                })
                a.write("{}")
                a.end()
                a = https.request({
                    hostname: 'api.codemao.cn',
                    port: 443,
                    path: '/nemo/v2/works/' + id + '/collection',
                    method: 'POST',
                    headers: headers,
                }, (re) => {
                    console.log("作品 " + id + " 自动收藏" + (re.statusCode == 200 ? "成功" : "失败 错误码 " + re.statusCode))
                })
                a.write("{}")
                a.end()
                await sleep(Math.random() * 1000)
            }
        })
    }).end()
    await sleep(Math.random() * 1000)
    main()
}

main()
