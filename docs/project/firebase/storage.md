# Current Cloud Storage

snapshot metadataは`../firebase.md`を参照してください。

clientは`src/lib/service/diaryImageClient.ts`です。

## Object and Firestore fields

```text
users/{uid}/diaries/{diaryId}/images/{imageId}.{extension}
```

日記には`id`、`storagePath`、`downloadURL`、`width`、`height`、`contentType`を保存します。

## Client processing

- UI上は1日記あたり最大2枚です。
- 絵日記保存ではAI生成画像を先頭に置き、手動画像と合わせて最大2枚です。手動画像が既に2枚なら生成・保存を開始しません。
- accepted MIMEはJPEG、PNG、WebP、HEIC、HEIFです。
- 長辺1600px超、700KiB超、またはHEIC / HEIFならCanvasでresize / compressします。
- 変換対象はWebPへ統一し、quality 0.60から0.82の範囲で500KiB以下になる最も高いqualityを探索します。
- quality調整だけで500KiB以下にならない場合は、長辺320pxを下限として解像度を段階的に下げます。
- 長辺320pxでも500KiBを超える場合やWebP encodingに対応していないbrowserではuploadしません。
- 700KiB以下かつ長辺1600px以下のJPEG / PNG / WebPは再encodeしません。
- upload metadataは`contentType`と`customMetadata.originalName`です。
- delete時の`storage/object-not-found`は成功相当です。
- AI生成画像も手動画像と同じpath、metadata、Firestore fields、編集 / 削除 / 共有挙動を使い、生成元fieldは持ちません。

## Storage Rules and public images

`firebase/storage.rules`はownerだけにread / deleteを許可します。create / updateはowner、10MiB未満、JPEG / PNG / WebPに限定します。

HEIC / HEIFは容量や解像度にかかわらずWebPへ変換してからuploadします。browserが入力画像をdecodeできない場合のuploadは失敗します。

共有documentはdownload URLをcopyし、公開画面の`img`へ渡します。未認証でのtoken URL挙動は未検証です。
