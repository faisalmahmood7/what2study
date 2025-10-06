import React from 'react'
import { Switch, Route } from 'react-router-dom'
import { ROUTES } from '../../config/routes'
import Overview from '../JobOffers/Overview'
import EditJobs from './EditJobs'

const Jobs = () => {
  return (
    <Switch>
      <Route path={`${ROUTES.GeneralState}/:id`}>
        <EditJobs />
      </Route>
      <Route path={`${ROUTES.General}`}>
        <Overview />
      </Route>
    </Switch>
  )
}

export default Jobs
