import { Suspense, lazy } from 'react'
import { BailoutToCSR } from './dynamic-bailout-to-csr'
import type { ComponentModule } from './types'
import { PreloadModule } from './collect-module.shared-runtime'

// Normalize loader to return the module as form { default: Component } for `React.lazy`.
// Also for backward compatible since next/dynamic allows to resolve a component directly with loader
// Client component reference proxy need to be converted to a module.
function convertModule<P>(
  mod: React.ComponentType<P> | ComponentModule<P> | undefined
): {
  default: React.ComponentType<P>
} {
  // Check "default" prop before accessing it, as it could be client reference proxy that could break it reference.
  // Cases:
  // mod: { default: Component }
  // mod: Component
  // mod: { $$typeof, default: proxy(Component) }
  // mod: proxy(Component)
  const hasDefault = mod && 'default' in mod
  return {
    default: hasDefault
      ? (mod as ComponentModule<P>).default
      : (mod as React.ComponentType<P>),
  }
}

const defaultOptions = {
  loader: () => Promise.resolve(convertModule(() => null)),
  loading: null,
  ssr: true,
}

interface LoadableOptions {
  loader?: () => Promise<React.ComponentType<any> | ComponentModule<any>>
  loading?: React.ComponentType<any> | null
  ssr?: boolean
}

function Loadable(options: LoadableOptions) {
  const opts = { ...defaultOptions, ...options }
  const Lazy = lazy(() => opts.loader().then(convertModule))
  const Loading = opts.loading

  function LoadableComponent(props: any) {
    const fallbackElement = Loading ? (
      <Loading isLoading={true} pastDelay={true} error={null} />
    ) : null

    const children = opts.ssr ? (
      <>
        {process.env.NODE_ENV === 'development' ? <PreloadModule /> : null}
        <Lazy {...props} />
      </>
    ) : (
      <BailoutToCSR reason="next/dynamic">
        <Lazy {...props} />
      </BailoutToCSR>
    )

    return <Suspense fallback={fallbackElement}>{children}</Suspense>
  }

  LoadableComponent.displayName = 'LoadableComponent'

  return LoadableComponent
}

export default Loadable
