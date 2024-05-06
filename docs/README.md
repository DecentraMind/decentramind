# README
 
## 使用 Vue Macros 的 Reactivity Transform

* https://vue-macros.dev/features/reactivity-transform.html
* https://vue-macros.dev/macros/define-models.html
* https://vue-macros.dev/macros/define-props.html

## Icon

* https://icones.js.org/

## i18n

在代码模板内的显示给用户看的文字内容统一需要用 `$t('How are you?')` 来写，例如

```html
<div>
  <div>
    {{ $t('How are you?')}}
  </div>
  <div>
    <i18n-t keypath="By signing in, you agree to our {0}">
      <NuxtLink to="/term" class="font-medium text-primary">{{ $t("Terms of Service") }}</NuxtLink>
    </i18n-t>
  </div>
</div>
```

以上翻译对应的内容在 `/lang/xxx.json` 里。

## 规范

1. 变量名函数名命名应该完整的英文单词，或者是合理的缩写，不应该出现类似  `joinC` 这样的命名
2. 各个目录下的代码的文件名及对应变量命名应该遵循同一个标准逻辑，比如 store 文件统一都是 `xxxStore.ts` 文件名，而里面的命名也是统一写为 `xxxStore`
3. 不需要使用 `reactive`,  直接定义为 `const state = $ref({taskLogo: ''})` 即可
4. 在 github 的 issue 内创建任务 issue 后，根据 issue 的 id 创建自己的任务 branch，branch 名字为 `issue-23`, 这里的 23 是对应创建 issue 时的 id