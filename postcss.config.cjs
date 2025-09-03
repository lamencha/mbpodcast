module.exports = {
  plugins: [
    require('autoprefixer'),
    require('cssnano')({
      preset: ['default', {
        discardComments: {
          removeAll: true,
        },
        reduceIdents: false, // Keep animation names for BR2049 effects
        mergeIdents: false, // Keep keyframe names
        normalizeWhitespace: true,
        colormin: true,
        discardUnused: {
          fontFace: false, // Keep Google Fonts
          keyframes: false, // Keep BR2049 animations
        }
      }]
    })
  ]
}