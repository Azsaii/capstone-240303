import React from 'react';
import { useSelector } from 'react-redux';
import AppMobile from './AppMobile';
import AppWeb from './AppWeb';

const AppDivider = () => {
  const isWeb = useSelector((state) => state.isWeb);
  return <>{isWeb ? <AppWeb /> : <AppMobile />}</>;
};

export default AppDivider;
