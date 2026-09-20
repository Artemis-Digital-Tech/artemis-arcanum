import { createContext, useContext } from 'react'

export type NavVariant = 'dropdown' | 'panel'

/**
 * Lets a header control know whether it is rendering inline (desktop) or
 * inside the mobile hamburger panel, without every page having to pass the
 * same prop down twice. Its own module so the components that read it and
 * the one that provides it don't have to import each other.
 */
export const NavVariantContext = createContext<NavVariant>('dropdown')

export function useNavVariant(): NavVariant {
  return useContext(NavVariantContext)
}
