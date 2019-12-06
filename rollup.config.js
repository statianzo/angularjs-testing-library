import * as pkg from './package.json'

const pkgDependencies = Object.keys({
  ...pkg.dependencies,
  ...pkg.devDependencies,
  ...pkg.peerDependencies,
  ...pkg.optionalDependencies,
})

export default {
  input: 'src/index',
  output: [
    {file: pkg.main, format: 'cjs', sourcemap: true},
    {file: pkg.module, format: 'es', sourcemap: true},
  ],
  external: [...pkgDependencies],
}
