# PS ARCHIVE — PS Store Legacy Catalog

PS1 / PS2 / PS3 / PSP / PS Vita / PCエンジンの旧PlayStation Store関連タイトルを集めた、日本語・ダークテーマの静的カタログです。

公開予定URL: https://mao2009.github.io/psstore/

## GitHub Pagesを公開する（一度だけ）

リポジトリの **Settings → Pages → Build and deployment → Source: GitHub Actions** を設定してください。`.github/workflows/pages.yml` が `main` の更新時に3,948件のデータとJavaScript構文を検証し、静的ファイルをPagesへ公開します。Sourceの変更後は Actions → Deploy PS ARCHIVE to GitHub Pages → Run workflow で再実行してください。

## 主な機能

- 全3,948タイトル、6プラットフォーム
- 日本語のタイトル・メーカー・備考をスペース区切りAND検索
- 機種、対象機器（PS3 / Vita）、DL価格帯、中古価格の有無、PS1配信中のみで絞り込み
- タイトル／中古相場／DL価格／配信日で並び替え
- カード・リスト表示、ページング、ゲーム詳細、URLへの検索条件保存
- パッケージ画像は登録済みのものを枠いっぱいに表示（必要に応じて端をトリミング）。画像未登録・読み込み失敗時は「画像未登録」と表示
- 870px以下の画面は検索条件のパネルを開閉でき、スマホでも検索・並び替え・詳細を操作可能

## データと制約

data/*.jsonはGoogleスプレッドシートから2026年11月2日に取り込んだ**静的スナップショット**です。Google Sheetとの自動同期はありません。

- publisher: 元データの「メーカー」欄から暫定的に配信元として表示。全件の配信元を個別検証したものではありません。
- developer: 元データには開発元がないため全件 null（未確認）。メーカーと開発元を混同しないため推測で埋めていません。
- downloadPrice / usedMin / usedMax: 参考価格。ソースに未記載なら null（未登録）。現時点の販売価格ではありません。
- devices: シリーズ別の目安。一部のPS1・PCE・PSPソフトはPS Vitaで動作しません。購入・ダウンロード・実機動作を保証しません。
- data/covers.json: ゲームキー「プラットフォーム|タイトル」ごとの画像URL辞書。出典は主としてLibretro thumbnailsです。画像の権利は各権利者に帰属します。

## パッケージ画像の取得と表示

- 登録済みの作品別URLは `data/covers.json` の `プラットフォーム|タイトル` キーで管理します。作品・地域版が一致するURLだけを登録してください。
- PS1は [xlenore/psx-covers](https://github.com/xlenore/psx-covers)、PS2は [xlenore/ps2-covers](https://github.com/xlenore/ps2-covers) の平面パッケージ画像に対応します。`data/*.json` のゲームに製品コード `serial`（または `coverSerial`）を設定した場合だけ候補URLを生成します。404時は [PSMT-Covers](https://github.com/SvenGDK/PSMT-Covers)（PS1/PS2）、その後既存のマッピングに順次フォールバックします。
- PS Vitaも製品コードがある場合は PSMT-Covers の `PSVita/<コード>.png` を試します。PS3についてはフォルダ内の命名規則を確認できていないため、現時点では確認済み画像URLを個別登録してください。
- PSPには従来のLibretroカバーを残します。PCエンジンの [xero/boxart](https://github.com/xero/boxart) はスクリーンショットや3Dボックスなどを合成した640×480の画像もあり、正面パッケージとは異なるため自動置換しません。PCEも正しい画像URLを確認できた作品から個別登録できます。
- 画像はカードの枠いっぱいに `object-fit: cover` で表示します。縦横比が違う画像は端が切れる場合があります。PS1・PCEは正方形、他機種は縦長の枠です。
- 現在のゲームデータには製品コードが登録されていないため、製品コードによる自動補完は今後のデータ追加分から有効です。タイトル名だけから製品コード・地域版を推測しません。

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