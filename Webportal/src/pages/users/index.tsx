import React from "react";
import PageContainer from "../../components/layout/PageContainer";
import { Switch, Route } from "react-router-dom";
import { ROUTES } from "../../config/routes";
import Overview from "./Overview";
import EditUser from "./EditUser";

const User = () => {
  return (
    <PageContainer button pageId='2' title='Nutzerverwaltung'>
      <Switch>
        <Route path={`${ROUTES.USER_URL}/edit`}>
          <EditUser />
        </Route>
        <Route path={`${ROUTES.USER_URL}`}>
          <Overview />
        </Route>
      </Switch>
    </PageContainer>
  );
};

export default User;
