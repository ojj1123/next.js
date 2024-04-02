import type { AppConfig } from '../../../build/utils'
import type { ExperimentalPPRConfig } from '../../config-shared'

/**
 * Returns true if partial prerendering is enabled for the application.
 */
export function isPPREnabled(
  config: ExperimentalPPRConfig | undefined
): boolean {
  // If the config is undefined, partial prerendering is disabled.
  if (typeof config === 'undefined') return false

  // If the config is a boolean, use it directly.
  if (typeof config === 'boolean') return config

  // If the config is a string, it must be 'incremental' to enable partial
  // prerendering.
  if (config === 'incremental') return true

  return false
}

/**
 * Returns true if partial prerendering is supported for the current page with
 * the provided app configuration.
 */
export function isPPRSupported(
  config: ExperimentalPPRConfig | undefined,
  appConfig: AppConfig
): boolean {
  // If the config is undefined or false, partial prerendering is disabled.
  if (typeof config === 'undefined' || config === false) {
    return false
  }

  // If the config is set to true, then the page supports partial prerendering.
  if (config === true) {
    return true
  }

  // If the config is a string, it must be 'incremental' to enable partial
  // prerendering.
  if (config === 'incremental' && appConfig.experimental_ppr === true) {
    return true
  }

  return false
}
