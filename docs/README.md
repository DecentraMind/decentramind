# README
 
## 使用 Vue Macros 的 Reactivity Transform

* https://vue-macros.dev/features/reactivity-transform.html
* https://vue-macros.dev/macros/define-models.html
* https://vue-macros.dev/macros/define-props.html

## Icon

* https://icones.js.org/


## 规范

1. 变量名函数名命名应该完整的英文单词，或者是合理的缩写，不应该出现类似  `joinC` 这样的命名
2. 各个目录下的代码的文件名及对应变量命名应该遵循同一个标准逻辑，比如 store 文件统一都是 `xxxStore.ts` 文件名，而里面的命名也是统一写为 `xxxStore`
3. 不需要使用 `reactive`,  直接定义为 `const state = $ref({taskLogo: ''})` 即可