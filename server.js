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
            } else {
                return new Response(previousWord);
            }

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

    // POST /reset: リセットする
    // _req.methodとpathnameを確認
    if (_req.method === "POST" && pathname === "/reset") {
        // previousWordを初期値にリセット
        previousWord = "しりとり";


        // リセット完了のメッセージを返す
        return new Response(
            JSON.stringify({
                "message": "しりとりがリセットされました",
                "previousWord": previousWord,
            }),
            {
                status: 200,  // HTTPステータスコード200は成功を意味する
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
            },
        );
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
