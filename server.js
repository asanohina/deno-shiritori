// // -----step3-----
// // Hello World!を表示
// console.log("Hello World!");

// // -----step4-----
// // localhostにDenoのHTTPサーバーを展開
// Deno.serve((_req) => new Response("Hello Deno!"));

// // -----step5-----
// // アクセス数を保持する変数をグローバル領域に定義
// let count = 0;

// // localhostにDenoのHTTPサーバーを展開
// Deno.serve((_req) => {
//     count++;
//     return new Response(`Hello World! ${count}`); // シングルクォート（'）ではなくバッククォート（`）
// });
// // カウントは2ずつ追加した

// // -----step6-----
// // localhostにDenoのHTTPサーバーを展開
// Deno.serve((_req) => {
//     return new Response(
//         // Responseの第一引数にレスポンスのbodyを設置
//         "<h1>H1見出しです</h1>",
//         // Responseの第二引数にヘッダ情報等の付加情報を設置
//         {
//             // レスポンスにヘッダ情報を付加
//             headers: {
//                 // text/html形式のデータで、文字コードはUTF-8であること
//                 "Content-Type": "text/html; charset=utf-8",
//             },
//         },
//     );
// });

// -----step7-----
// // localhostにDenoのHTTPサーバーを展開
// Deno.serve(async (_req) => {
//     const htmlText = await Deno.readTextFile("./public/index.html");

//     return new Response(
//         // Responseの第一引数にレスポンスのbodyを設置
//         htmlText,
//         // Responseの第二引数にヘッダ情報等の付加情報を設置
//         {
//             // レスポンスにヘッダ情報を付加
//             headers: {
//                 // text/html形式のデータで、文字コードはUTF-8であること
//                 "Content-Type": "text/html; charset=utf-8",
//             },
//         },
//     );
// });

// // -----step7-2-----
// // localhostにDenoのHTTPサーバーを展開
// Deno.serve(async (_req) => {
//     // パス名を取得する
//     // http://localhost:8000/hoge に接続した場合"/hoge"が取得できる
//     const pathname = new URL(_req.url).pathname;
//     console.log(`pathname: ${pathname}`);

//     // http://localhost:8000/styles.css へのアクセス時、"./public/styles.css"を返す
//     if (pathname === "/styles.css") {
//         const cssText = await Deno.readTextFile("./public/styles.css");
//         return new Response(
//             cssText,
//             {
//                 headers: {
//                     // text/css形式のデータで、文字コードはUTF-8であること
//                     "Content-Type": "text/css; charset=utf-8",
//                 },
//             },
//         );
//     }

//     // http://localhost:8000/ へのアクセス時、"./public/index.html"を返す
//     const htmlText = await Deno.readTextFile("./public/index.html");
//     return new Response(
//         // Responseの第一引数にレスポンスのbodyを設置
//         htmlText,
//         // Responseの第二引数にヘッダ情報等の付加情報を設置
//         {
//             // レスポンスにヘッダ情報を付加
//             headers: {
//                 // text/html形式のデータで、文字コードはUTF-8であること
//                 "Content-Type": "text/html; charset=utf-8",
//             },
//         },
//     );
// });

// // -----step7-3-----
// import { serveDir } from "jsr:@std/http/file-server";

// // localhostにDenoのHTTPサーバーを展開
// Deno.serve(async (_req) => {
//     // ./public以下のファイルを公開
//     return serveDir(
//         _req,
//         {
//             /*
//             - fsRoot: 公開するフォルダを指定
//             - urlRoot: フォルダを展開するURLを指定。今回はlocalhost:8000/に直に展開する。
//             - enableCors: CORSの設定を付加するか
//             */
//             fsRoot: "./public/",
//             urlRoot: "",
//             enableCors: true,
//         },
//     );
// });

// しりとりアプリ
import { serveDir } from "jsr:@std/http/file-server";

// 直前の単語を保持しておく
let previousWord = "しりとり";

// localhostにDenoのHTTPサーバーを展開
Deno.serve(async (_req) => {
    // パス名を取得する
    // http://localhost:8000/hoge に接続した場合"/hoge"が取得できる
    const pathname = new URL(_req.url).pathname;
    console.log(`pathname: ${pathname}`);

    // GET/shiritori: 直前の単語を返す
    // 「===」は完全一致を確認する演算子
    if (_req.method === "GET" && pathname === "/shiritori") {
        return new Response(previousWord);
    }

    // POST/shiritori: 次の単語を受け取って保存する
    if (_req.method === "POST" && pathname === "/shiritori") {
        // リクエストのペイロードを取得
        const requestJson = await _req.json();
        // JSONの中からnextWordを取得
        const nextWord = requestJson["nextWord"];

        // previousWordの末尾とnextWordの先頭が同一か確認
        // previousWord.slice(-1)はpreviousWordの末尾の文字を取得
        // nextWord.slice(0, 1)はnextWordの先頭の文字
        if (previousWord.slice(-1) === nextWord.slice(0, 1)) {
            // 同一であれば、previousWordを更新
            previousWord = nextWord;

            // 末尾が「ん」になっている場合
            if (previousWord.slice(-1) === "ん") {
                // サーバーから「終了」のメッセージを返す
                return new Response(
                    JSON.stringify({
                        "message": "しりとりが終了しました",
                        "previousWord": previousWord,
                    }),
                    {
                        status: 200,  // HTTPステータスコード200は成功を意味する
                        headers: {
                            "Content-Type": "application/json; charset=utf-8",
                        },
                    },
                );
            };

        } // 同一でない単語の入力時に、エラーを返す
        else {
            // サーバーからエラーを返す
            return new Response(
                JSON.stringify({
                    "errorMessage": "前の単語に続いていません",
                    "errorCode": "10001",
                }),
                {
                    status: 400,  // HTTPステータスコード400はBad Requestを意味する
                    headers: {
                        "Content-Type": "application/json; charset=utf-8",
                    },
                },
            );
        }

        // 現在の単語を返す
        return new Response(previousWord);
    }

    // ./public以下のファイルを公開
    // ユーザーがブラウザでファイルにアクセスできるようにする
    return serveDir(
        _req,
        {
            /*
            - fsRoot: 公開するフォルダを指定　（./public/以下のファイルを公開）
            - urlRoot: フォルダを展開するURLを指定。今回はlocalhost:8000/に直に展開する。
            - enableCors: CORSの設定を付加するか
            */
            fsRoot: "./public/",
            urlRoot: "",
            enableCors: true,
        },
    );
});
