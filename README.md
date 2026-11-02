# PS ARCHIVE — PS Store Legacy Catalog

PS1 / PS2 / PS3 / PSP / PS Vita / PCエンジンの旧PlayStation Store関連タイトルを集めた、日本語・ダークテーマの静的カタログです。

公開予定URL: https://mao2009.github.io/psstore/

## GitHub Pagesを公開する（一度だけ）

リポジトリの **Settings → Pages → Build and deployment → Source: GitHub Actions** を設定してください。`.github/workflows/pages.yml` が `main` の更新時に3,948件のデータとJavaScript構文を検証し、静的ファイルをPagesへ公開します。Sourceの変更後は Actions → Deploy PS ARCHIVE to GitHub Pages → Run workflow で再実行してください。

## 主な機能

- 全3,948タイトル、6プラットフォーム
- 日本語のタイトル・メーカー・製品コード・備考をスペース区切りAND検索
- 機種、対象機器（PS3 / Vita）、DL価格帯で絞り込み
- 初期表示はタイトル順（日本語照合）。中古相場／DL価格／配信日でも並び替え
- カード・リスト表示、ページング、ゲーム詳細、URLへの検索条件保存
- パッケージ画像は登録済みのものを枠いっぱいに表示（必要に応じて端をトリミング）。画像未登録・読み込み失敗時は「画像未登録」と表示
- 870px以下の画面は検索条件のパネルを開閉でき、スマホでも検索・並び替え・詳細を操作可能

## データと制約

data/*.jsonはGoogleスプレッドシートから2026年11月2日に取り込んだ**静的スナップショット**です。Google Sheetとの自動同期はありません。

- publisher: 元データの「メーカー」欄から暫定的に配信元として表示。全件の配信元を個別検証したものではありません。
- developer: 元データには開発元がないため全件 null（未確認）。メーカーと開発元を混同しないため推測で埋めていません。
- downloadPrice / usedMin / usedMax: 参考価格。ソースに未記載なら null（未登録）。現時点の販売価格ではありません。
- devices: シリーズ別の目安。一部のPS1・PCE・PSPソフトはPS Vitaで動作しません。購入・ダウンロード・実機動作を保証しません。
- serial: 国内版パッケージの製品コード（PS1/PS2/PS3/PSP）またはPS VitaタイトルID。複数版の特定が必要なものは未登録。
- storeId: PSPのダウンロード版タイトルID。物理パッケージの製品コードとは異なります。
- sortKana: （任意）正確な五十音順が必要な漢字タイトルの読み仮名。未指定の場合、ja-JP の照合順にフォールバックします。
- data/covers.json: ゲームキー「プラットフォーム|タイトル」ごとの画像URL辞書。出典は主としてLibretro thumbnailsです。画像の権利は各権利者に帰属します。

## パッケージ画像の取得と表示

- 登録済みの作品別URLは `data/covers.json` の `プラットフォーム|タイトル` キーで管理します。作品・地域版が一致するURLだけを登録してください。
- PS1は [xlenore/psx-covers](https://github.com/xlenore/psx-covers)、PS2は [xlenore/ps2-covers](https://github.com/xlenore/ps2-covers) の平面パッケージ画像に対応します。`data/*.json` のゲームに製品コード `serial`（または `coverSerial`）を設定した場合だけ候補URLを生成します。404時は [PSMT-Covers](https://github.com/SvenGDK/PSMT-Covers)（PS1/PS2）、その後既存のマッピングに順次フォールバックします。
- PS VitaはPSMT-Covers の `PSVita/<コード>.png`、PS3は同データベースの `PS3/<コード>.JPG`（拡張子大文字）を試します。画像の存在を確認できないタイトルは従来の画像にフォールバックします。
- PSPのパッケージ製品コードが判明している作品は [jamescook/psx-artwork](https://github.com/jamescook/psx-artwork) も試します。取得できない場合は従来のLibretroカバーを使用します。PCエンジンの [xero/boxart](https://github.com/xero/boxart) はスクリーンショットや3Dボックスなどを合成した640×480の画像もあり、正面パッケージとは異なるため自動置換しません。PCEも正しい画像URLを確認できた作品から個別登録できます。
- 画像はカードの枠いっぱいに `object-fit: cover` で表示します。縦横比が違う画像は端が切れる場合があります。PS1・PCEは正方形、他機種は縦長の枠です。
- 2026-11-03に複数のタイトルIDデータベースを照合し、タイトルが厳密一致し、候補IDがただ1つの作品のみ登録しました。同一作品の通常版/廉価版、またはディスク版/配信版など複数のコードがある場合は自動確定しません。画像は実ブラウザでロードが成功した候補のみ表示し、未登録画像を補完します。

## 製品コードと画像URLの出典（2026-11-03）

- PS1： [PSBBN Definitive Project / TitlesDB_PS1.csv](https://github.com/CosmicScale/PSBBN-Definitive-Project/blob/main/scripts/assets/database/TitlesDB_PS1.csv)
- PS2： [PSBBN Definitive Project / TitlesDB_PS2.csv](https://github.com/CosmicScale/PSBBN-Definitive-Project/blob/main/scripts/assets/database/TitlesDB_PS2.csv)
- PS3： [PS3GameUpdateDownloader / titledb.json](https://github.com/shinrax2/PS3GameUpdateDownloader/blob/master/titledb.json)
- PSPダウンロード版・PS Vita： [PSVITA-PKGJ-DATADB](https://github.com/txy7795679/PSVITA-PKGJ-DATADB) の `PSP_GAMES.tsv` / `PSV_GAMES.tsv`（日本リージョン）
- PSPパッケージ版： [psxdata / psp/ntsc-j.json](https://github.com/ticky/psxdata/blob/develop/psp/ntsc-j.json)
- ゲームの地域・版が曖昧な候補は採用していません。数字の一致だけでは「国内パッケージ画像を確認した」ことにはなりません。外部画像が404の場合は次の候補へ進みます。
- 五十音順：`sortKana` がある作品では読み順、それ以外は `Intl.Collator("ja-JP")` による日本語照合です。漢字タイトル全件の正しい読み順は未整備です。

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