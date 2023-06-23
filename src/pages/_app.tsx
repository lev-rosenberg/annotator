import React from 'react';
import { Provider } from 'react-redux';
import store from '../store/store';
import '../globals.css';


function MyApp({ Component, pageProps }: any) {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}

export default MyApp;