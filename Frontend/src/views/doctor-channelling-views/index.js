import React, { lazy, Suspense } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import Loading from 'components/shared-components/Loading';
import { DOCTOR_CHANNELLING_PREFIX_PATH } from 'configs/AppConfig'

export const DoctorChannellingViews = () => {
  return (
    <Suspense fallback={<Loading cover="content"/>}>
      <Switch>
        <Route path={`${DOCTOR_CHANNELLING_PREFIX_PATH}/home`} component={lazy(() => import(`./home`))} />
        <Redirect from={`${DOCTOR_CHANNELLING_PREFIX_PATH}`} to={`${DOCTOR_CHANNELLING_PREFIX_PATH}/home`} />
      </Switch>
    </Suspense>
  )
}

export default React.memo(DoctorChannellingViews);