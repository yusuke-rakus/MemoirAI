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
- accepted MIMEはJPEG、PNG、WebP、HEIC、HEIFです。
- 長辺1600px超または10MiB以上ならCanvasでresize / compressします。
- WebPは維持し、それ以外はJPEG、quality 0.82へ変換します。
- 変換後blobのsizeは再検証しません。
- upload metadataは`contentType`と`customMetadata.originalName`です。
- delete時の`storage/object-not-found`は成功相当です。

## Storage Rules and public images

`firebase/storage.rules`はownerだけにread / deleteを許可します。create / updateはowner、10MiB未満、JPEG / PNG / WebPに限定します。

小さく長辺1600px以下のHEIC / HEIFは再encodeされず、clientのaccepted MIMEとRulesが一致しません。これはcode/config比較で確認した不一致で、実uploadは未検証です。

共有documentはdownload URLをcopyし、公開画面の`img`へ渡します。未認証でのtoken URL挙動は未検証です。
