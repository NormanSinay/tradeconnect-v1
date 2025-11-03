export default {
  presets: [
    ['@babel/preset-env', {
      targets: { node: 'current' },
      modules: false
    }],
    '@babel/preset-react',
    '@babel/preset-typescript'
  ],
  plugins: [
    ['babel-plugin-transform-import-meta', {
      module: 'ES6'
    }]
  ]
};