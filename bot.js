require('dotenv').config();
const Mastodon = require('mastodon-api');


console.log("Mastodon Bot starting...");

const M = new Mastodon({
    client_key: process.env.CLIENT_KEY,
    client_secret: process.env.CLIENT_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    timeout_ms: 60 * 1000,  // optional HTTP request timeout to apply to all requests.
    api_url: process.env.API_URL, // optional, defaults to https://mastodon.social/api/v1/
})

function toot(mystr, id, visib) {
    const params = {
        status: mystr,
    }
    if (id) {
        params.in_reply_to_id = id;
    }
    if (visib) {
        params.visibility = visib;
    }

    M.post('statuses', params, (error, data) => {
        if (error) {
            console.error(error);
        } else {
            console.log(`Posted: ${data.content}`);
        }
    });
}


const listener = M.stream('streaming/user')

listener.on('message', msg => {
    console.log("got a message.");

    if (msg.event === 'notification') {

        // 若有人关注，则发一条博文艾特并感谢
        if (msg.data.type === 'follow') {
            const acct = msg.data.account.acct;
            toot(`@${acct} 菩萨保佑你`, null ,"direct");
            console.log("Followed by somebody");
        } else if (msg.data.type === 'mention') {

            // 一定给对方点赞
            const regex1 = /(一定)/i;
            const regex2 = /(我爱你|我愛你)/i;

            const content = msg.data.status.content;
            const id = msg.data.status.id;
            const visib = msg.data.status.visibility;
            console.log("mentioned by someone!");
            if (regex1.test(content)) {
                M.post(`statuses/${id}/favourite`, (error, data) => {
                    if (error) {
                        console.error(error);
                    } else {
                        console.log(`Favorated: ${data.content}`);
                    }
                });
            }


            // 被告白了

            else if (regex2.test(content)) {
                console.log("i will not interact");
                const acct = msg.data.account.acct;
                const reply = `@${acct} 请多做好事。`;
                toot(reply, id, visib);
            }
            
            else {
                const num = Math.round(Math.random());
                console.log(num);
                if (num == 1) {
                    M.post(`statuses/${id}/favourite`, (error, data) => {
                        if (error) {
                            console.error(error);
                        } else {
                            console.log(`Favorated: ${data.content}`);
                        }
                    })
                };
            }

        }
    }
});

listener.on('error', err => console.log(err))