# ModdedFeatsAddon

---

`ModdedFeatsAddon` : `ModdedFeatsAddon`

```json lines
{
  "additionFile": [
    "feats1.json",
    "feats2.json"
  ],
  "addonPlugin": [
    {
      "modName": "ModdedFeatsAddon",
      "addonName": "ModdedFeatsAddon",
      "modVersion": "^1.0.0",
      "params": {
        "feats": [
          // 可以将其拆分为多个文件，在注入游戏时会按顺序合并到一起注入
          // It can be split into multiple files, which will be merged in order when injected into the game
          "feats1.json",
          "feats2.json"
        ]
      }
    },
    {
      // 对于需要添加图片的情况，请别忘了添加这个addon标识来让图片加载器加载衣服的图片
      // ModdedClothesAddon不实现导入图片的功能，导入图片的工作交由ImageLoaderAddon来完成。所以请别忘了按照ImageLoaderAddon的规则来添加图片
      // for the case that need to add image, please don't forget to add this addon mark to let the image loader load the image of the clothes
      // ModdedClothesAddon don't implement the function of import image, the work of import image is completed by ImageLoaderAddon. 
      // So please don't forget to add image according to the rules of ImageLoaderAddon
      "modName": "ModLoader DoL ImageLoaderHook",
      "addonName": "ImageLoaderAddon",
      "modVersion": "^2.3.0",
      "params": [
      ]
    }
  ],
  "dependenceInfo": [
    {
      "modName": "ModdedFeatsAddon",
      "version": "^1.0.0"
    },
    {
      "modName": "ModLoader DoL ImageLoaderHook",
      "version": "^2.3.0"
    }
  ]
}
```

下面是 `feats1.json` 的例子:  
follow is the example of `feats1.json`:  

```json5
{
  "Pocket Change": {
    title: "Pocket Change",
    desc: "Have £1,000.",
    difficulty: 1,
    series: "money",
    filter: ["All", "General"],
    softLockable: true,
  },
  "Money Maker": {
    title: "Money Maker",
    desc: "Have £10,000.",
    difficulty: 1,
    series: "money",
    filter: ["All", "General"],
    softLockable: true,
  },
  Tycoon: {
    title: "Tycoon",
    desc: "Have £100,000.",
    difficulty: 2,
    series: "money",
    filter: ["All", "General"],
    softLockable: true,
  },
}
```
