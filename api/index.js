const express = require('express')

// Create express instance
const app = express()

// // Require API routes
const SpellCheckerApi = require('./spellchecker')
const SimpleSpellCheckApi = require(`./simpleSpellcheckApi`)

// // Import API Routes
app.use(SpellCheckerApi)
app.use(SimpleSpellCheckApi)

// Export express app
module.exports = {
  path: '/interApi',
  handler: app
}

// Start standalone server if directly running
if (require.main === module) {
  const port = process.env.PORT || 4000
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API server listening on port ${port}`)
  })
}
