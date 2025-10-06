import React from 'react'
import { Switch, Route } from 'react-router-dom'
import { ROUTES } from '../../config/routes'
import EditIntents from './EditIntents'
import Overview from './Overview'

const Intents = () => {
  return (
    <Switch>
      <Route path={`${ROUTES.IntentsState}/:id`}>
        <EditIntents />
      </Route>
      <Route path={`${ROUTES.Intents}`}>
        <Overview />
      </Route>
    </Switch>
  )
}

export default Intents
