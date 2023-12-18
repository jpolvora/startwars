import express from 'express'
import {
  addIndexRoutes,
  addImportRoutes,
  addPersonagensRoutes,
} from '../routes/index.js'

import swaggerUi from 'swagger-ui-express'
import { Services } from './Services.js'

export class ExpressAdapter {
  isConfigured = false

  constructor(container) {
    this.container = container

    const app = express()

    //place here all needed middlewares

    app.use(express.static('public'))
    app.use(express.json())

    this.app = app

    this.isConfigured = false
  }

  async initialize() {
    if (this.isConfigured) return this.app
    this.isConfigured = true

    const routes = [addIndexRoutes, addImportRoutes, addPersonagensRoutes]

    for (const useRoute of routes) {
      const router = express.Router()
      useRoute(router, this.container)
      this.app.use('/api', router)
    }

    // const env = this.container.get(Services.env)
    // const isTest = env.NODE_ENV === 'test'
    // console.log('isTest', isTest)
    // const swaggerFile = isTest
    //   ? {}
    //   : await import('../swagger-output.json', {
    //       assert: {
    //         type: 'json',
    //       },
    //     })

    const swaggerFile = await import('../swagger-output.json', {
      assert: {
        type: 'json',
      },
    })

    this.app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile.default))

    return this.app
  }
}
