# CONTRIBUTION
 
## Using Vue Macros' Reactivity Transform

* https://vue-macros.dev/features/reactivity-transform.html
* https://vue-macros.dev/macros/define-models.html
* https://vue-macros.dev/macros/define-props.html

In components, prefer using `const state = $ref(1)` over `const state = ref(1)`.
In stores and composables, prefer using standard ref over $ref.

## Icon

* https://icones.js.org/

Prefer using icons from the heroicons collection.

## i18n

Text content displayed to users in code templates should be written using `$t('How are you?')`, for example:

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

The corresponding translation content for the above is in `/lang/xxx.json`.

## Guidelines

1. Variable and function names should use camelCase naming, using complete English words or reasonable abbreviations. Names like `joinC` should not appear.
2. File names and corresponding variable names in each directory should follow the same standard logic. For example, store files should all be named `xxxStore.ts`, and the naming inside should also be consistently written as `xxxStore`.
3. After creating a task issue in GitHub issues, create your own task branch based on the issue ID. The branch name should be `issue-23`, where 23 is the corresponding ID when the issue was created.