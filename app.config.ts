export default defineAppConfig({
  ui: {
    primary: 'sky',
    gray: 'cool',
    button: {
      default: {
        loadingIcon: 'svg-spinners:gooey-balls-2'
      }
    },
    icons: {
      dynamic: true
    },
    alert: {
      icon: {
        base: 'w-6 h-7',
      },
      title: 'text-xl font-semibold mb-2',
      description: 'mt-1 text-sm leading-6 text-gray-600 text-justify',
    },
    avatar: {
      rounded: 'object-cover'
    },
    formGroup: {
      label: {
        base: 'font-semibold w-full text-gray-500'
      },
      // label: {
      //   wrapper: 'content-end text-right text-nowrap mr-4',
      //   base: 'w-24 font-bold',
      // },
      error: 'absolute mt-1'
    },
    input: {
      base: 'placeholder:font-normal placeholder:text-sm',
      size: {
        '2xs': 'text-sm',
        xs: 'text-base',
        sm: 'text-base',
        md: 'text-base',
        lg: 'text-base',
        xl: 'text-base',
      },
    },
    inputMenu: {
      option: {
        container: 'gap-1'
      }
    },
    table: {
      loadingState: {
        icon: 'animate-none'
      },
      default: {
        loadingState: {
          icon: 'svg-spinners:3-dots-fade',
          label: ''
        },
        emptyState: {
          label: 'Empty'
        }
      }
    }
  }
})

declare module '@nuxt/schema' {
  interface AppConfigInput {
    // myLayer?: {
    //   /** Project name */
    //   name?: string
    // }
  }
}
