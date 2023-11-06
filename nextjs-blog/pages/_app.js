// pages/_app.js

import './styles.css'; // Import the CSS file
import { Component } from 'react';

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
  
}
