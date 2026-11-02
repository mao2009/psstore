# PS Store Legacy Catalog

日本語・ダークテーマのPS Store旧機種向けゲームカタログ。GitHub Pagesで動く静的サイトです。

- [Webサイト](https://mao2009.github.io/psstore/)
- データ: `data/*.json`（Googleスプレッドシートからスナップショット生成）
- ビルド不要: `index.html` をローカルHTTPサーバーで公開するだけで動作

## 開発

```bash
python3 -m http.server 8000
```

`http://localhost:8000/` にアクセスします。

## 注意

配信元は元データの「メーカー」列を暫定的に使用し、開発元未調査タイトルは「未確認」と表示します。旧ストア価格・中古相場は掲載時点の参考値であり、現在の販売状況や購入可否を保証しません。PS Vita / PS3 対応にはタイトル別例外があります。
