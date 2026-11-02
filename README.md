# PS ARCHIVE — PS Store Legacy Catalog

PS1 / PS2 / PS3 / PSP / PS Vita / PCエンジンの旧PlayStation Store関連タイトルを集めた、日本語・ダークテーマの静的カタログです。

公開予定URL: https://mao2009.github.io/psstore/

## GitHub Pagesを公開する（一度だけ）

リポジトリの **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: main / (root) → Save** を設定してください。ビルド不要、ファイルはすでにmainのルートにあります。

## 主な機能

- 全3,948タイトル、6プラットフォーム
- 日本語のタイトル・メーカー・備考をスペース区切りAND検索
- 機種、対象機器（PS3 / Vita）、DL価格帯、中古価格の有無、PS1配信中のみで絞り込み
- タイトル／中古相場／DL価格／配信日で並び替え
- カード・リスト表示、ページング、ゲーム詳細、URLへの検索条件保存
- パッケージ画像は登録済みのものを表示し、未登録・読み込み失敗時は代替表示

## データと制約

data/*.jsonはGoogleスプレッドシートから2026年11月2日に取り込んだ**静的スナップショット**です。Google Sheetとの自動同期はありません。

- publisher: 元データの「メーカー」欄から暫定的に配信元として表示。全件の配信元を個別検証したものではありません。
- developer: 元データには開発元がないため全件 null（未確認）。メーカーと開発元を混同しないため推測で埋めていません。
- downloadPrice / usedMin / usedMax: 参考価格。ソースに未記載なら null（未登録）。現時点の販売価格ではありません。
- devices: シリーズ別の目安。一部のPS1・PCE・PSPソフトはPS Vitaで動作しません。購入・ダウンロード・実機動作を保証しません。
- data/covers.json: ゲームキー「プラットフォーム|タイトル」ごとの画像URL辞書。出典は主としてLibretro thumbnailsです。画像の権利は各権利者に帰属します。

## ローカル実行

~~~bash
python3 -m http.server 8000
~~~

http://localhost:8000/ を開きます。file:// からは fetch() が利用できないためHTTPサーバーが必要です。

## 検証

~~~bash
node --check app.js
node scripts/check-catalog.mjs
~~~

非公式ファンサイト。配信元や価格などの情報は正確性・最新性を保証しません。